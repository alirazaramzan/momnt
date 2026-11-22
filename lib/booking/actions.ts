"use server";

import { revalidatePath } from "next/cache";
import { calculateDepositAmount } from "@/lib/booking/config";
import {
  formatBookingStatusLabel,
  validateBookingTransition,
  type BookingActorRole,
  type DbBookingStatus,
} from "@/lib/booking/transitions";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validators/auth";
import {
  acceptBookingProposalSchema,
  createBookingRequestSchema,
  proposeBookingChangeSchema,
  setAvailabilityBatchSchema,
  setAvailabilityDateSchema,
  transitionBookingStatusSchema,
  type CreateBookingField,
  type CreateBookingResult,
  type ProposeBookingField,
} from "@/lib/validators/booking";

const TRY_AGAIN = "Something went wrong on our side. Try again in a moment.";
const SIGNED_OUT = "Sign in to your Momnt account to continue.";

function revalidateBookingAndCalendarPaths(photographerId?: string | null) {
  revalidatePath("/photographer");
  revalidatePath("/photographer/calendar");
  revalidatePath("/photographer/requests");
  revalidatePath("/photographer/projects");
  revalidatePath("/client");
  revalidatePath("/client/bookings");
  revalidatePath("/photographers");
  if (photographerId) {
    revalidatePath(`/photographers/${photographerId}`);
    revalidatePath(`/book/${photographerId}`);
  }
}

async function ensurePhotographerProfileExists(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { data: existing, error: selectErr } = await supabase
    .from("photographer_profiles")
    .select("profile_id")
    .eq("profile_id", userId)
    .maybeSingle();

  if (selectErr) return false;
  if (existing) return true;

  const { error: insertErr } = await supabase
    .from("photographer_profiles")
    .insert({ profile_id: userId });

  return !insertErr;
}

// ---------------------------------------------------------------------------
// 1. Availability Calendar Actions (Prompt 6.1)
// ---------------------------------------------------------------------------

export type AvailabilityActionResult =
  | {
      ok: true;
      updatedDates: string[];
      status: "available" | "booked" | "unavailable";
    }
  | { ok: false; error: string };

/**
 * Sets a single date's availability status (`available`, `booked`, or `unavailable`)
 * in the `public.availability` table for the signed-in photographer.
 */
export async function setPhotographerAvailabilityDate(
  input: unknown
): Promise<AvailabilityActionResult> {
  const parsed = setAvailabilityDateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Select a valid calendar date.",
    };
  }

  return setPhotographerAvailabilityBatch({
    dates: [parsed.data.date],
    status: parsed.data.status,
  });
}

/**
 * Sets one or more dates to `available`, `booked`, or `unavailable` in
 * `public.availability` for the signed-in photographer.
 *
 * Prevents clearing or changing dates that have an active committed booking
 * and returns a clear, human-friendly conflict message.
 */
export async function setPhotographerAvailabilityBatch(
  input: unknown
): Promise<AvailabilityActionResult> {
  const parsed = setAvailabilityBatchSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ??
        "Select at least one valid date on the calendar.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIGNED_OUT };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "photographer") {
    return {
      ok: false,
      error: "Only photographer accounts can update the availability calendar.",
    };
  }

  const ready = await ensurePhotographerProfileExists(supabase, user.id);
  if (!ready) return { ok: false, error: TRY_AGAIN };

  const { dates, status } = parsed.data;

  // Check if any selected date is locked by an accepted/active booking
  if (status !== "booked") {
    const { data: committedRows } = await supabase
      .from("bookings")
      .select("event_date, event_type")
      .eq("photographer_id", user.id)
      .in("event_date", dates)
      .in("status", [
        "accepted",
        "deposit_paid",
        "shoot_done",
        "delivered",
        "completed",
      ]);

    if (committedRows && committedRows.length > 0) {
      const conflictDate = committedRows[0].event_date;
      const conflictEvent = committedRows[0].event_type;
      return {
        ok: false,
        error: `${conflictDate} has an active ${conflictEvent} booking and must stay marked as booked unless the booking is cancelled.`,
      };
    }
  }

  const rowsToUpsert = dates.map((date) => ({
    photographer_id: user.id,
    date,
    status,
  }));

  const { error } = await supabase.from("availability").upsert(rowsToUpsert, {
    onConflict: "photographer_id,date",
  });

  if (error) {
    if (error.code === "23505" || error.message?.includes("active booking")) {
      return {
        ok: false,
        error:
          "One or more selected dates have an active booking and cannot be changed from booked.",
      };
    }
    return { ok: false, error: TRY_AGAIN };
  }

  revalidateBookingAndCalendarPaths(user.id);
  return {
    ok: true,
    updatedDates: dates,
    status,
  };
}

// ---------------------------------------------------------------------------
// 2. Client Booking Request Submission (Prompt 6.2)
// ---------------------------------------------------------------------------

/**
 * Creates a booking request on the server:
 * - Validates all fields with zod (`createBookingRequestSchema`)
 * - Checks the user is signed in with role `client` or `agency` (and not booking themselves)
 * - Checks the target photographer exists and has `verification_status = 'verified'`
 * - Checks the event date is available (not marked `booked` or `unavailable` in
 *   `availability` and no committed booking exists on that date)
 * - Looks up the selected package on the server and derives `price`,
 *   `deposit_amount` (25% mock deposit), and default `duration_hours` from the
 *   package row — never trusting client-submitted prices.
 */
export async function submitBookingRequest(
  input: unknown
): Promise<CreateBookingResult> {
  const parsed = createBookingRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: toFieldErrors<CreateBookingField>(parsed.error),
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      fieldErrors: {},
      formError:
        "Sign in with a client or agency account to send a booking request.",
    };
  }

  const { data: viewerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!viewerProfile || !["client", "agency"].includes(viewerProfile.role)) {
    return {
      ok: false,
      fieldErrors: {},
      formError:
        "Only client and agency accounts can send booking requests. Switch to a client account to book.",
    };
  }

  const data = parsed.data;

  if (data.photographer_id === user.id) {
    return {
      ok: false,
      fieldErrors: {},
      formError: "You cannot submit a booking request to your own profile.",
    };
  }

  // 1. Check photographer is verified
  const { data: phRow, error: phError } = await supabase
    .from("photographer_profiles")
    .select("profile_id, verification_status")
    .eq("profile_id", data.photographer_id)
    .maybeSingle();

  if (phError || !phRow || phRow.verification_status !== "verified") {
    return {
      ok: false,
      fieldErrors: {},
      formError:
        "This photographer is not currently verified to accept new bookings.",
    };
  }

  // 2. Fetch the package from the server (price always comes from the server package)
  const { data: pkgRow, error: pkgError } = await supabase
    .from("packages")
    .select("id, photographer_id, name, price, hours")
    .eq("id", data.package_id)
    .eq("photographer_id", data.photographer_id)
    .maybeSingle();

  if (pkgError || !pkgRow) {
    return {
      ok: false,
      fieldErrors: {
        package_id: "Select a valid package offered by this photographer.",
      },
    };
  }

  // 3. Check the date is available on the photographer's calendar
  const [availCheck, committedBookingCheck] = await Promise.all([
    supabase
      .from("availability")
      .select("status")
      .eq("photographer_id", data.photographer_id)
      .eq("date", data.event_date)
      .maybeSingle(),
    supabase
      .from("bookings")
      .select("id")
      .eq("photographer_id", data.photographer_id)
      .eq("event_date", data.event_date)
      .in("status", [
        "accepted",
        "deposit_paid",
        "shoot_done",
        "delivered",
        "completed",
      ])
      .maybeSingle(),
  ]);

  if (
    committedBookingCheck.data ||
    (availCheck.data &&
      (availCheck.data.status === "booked" ||
        availCheck.data.status === "unavailable"))
  ) {
    return {
      ok: false,
      fieldErrors: {
        event_date:
          "This date is already booked or unavailable. Choose an open date from the calendar.",
      },
      formError:
        "The selected date is not available on this photographer's calendar.",
    };
  }

  // 4. Derive server price, 25% deposit, duration, and budget
  const serverPrice = pkgRow.price;
  const serverDeposit = calculateDepositAmount(serverPrice);
  const durationHours = data.duration_hours ?? pkgRow.hours;
  const budgetPkr = data.budget ?? serverPrice;

  const { data: inserted, error: insertError } = await supabase
    .from("bookings")
    .insert({
      client_id: user.id,
      photographer_id: data.photographer_id,
      package_id: pkgRow.id,
      event_type: data.event_type,
      event_date: data.event_date,
      start_time: data.start_time,
      location: data.location,
      duration_hours: durationHours,
      guests: data.guests,
      budget: budgetPkr,
      price: serverPrice,
      deposit_amount: serverDeposit,
      requirements: data.requirements,
      status: "requested",
    })
    .select(
      "id, event_type, event_date, start_time, location, duration_hours, guests, budget, requirements, package_id, price, deposit_amount, status"
    )
    .single();

  if (insertError || !inserted) {
    if (
      insertError?.code === "23505" ||
      insertError?.message?.toLowerCase().includes("no longer available") ||
      insertError?.message?.toLowerCase().includes("already booked")
    ) {
      return {
        ok: false,
        fieldErrors: {
          event_date:
            "This date was just booked or marked unavailable. Pick another date.",
        },
        formError:
          "This date is no longer available on the photographer's calendar.",
      };
    }
    return {
      ok: false,
      fieldErrors: {},
      formError: TRY_AGAIN,
    };
  }

  revalidateBookingAndCalendarPaths(data.photographer_id);

  return {
    ok: true,
    booking: {
      id: inserted.id,
      event_type: inserted.event_type,
      event_date: inserted.event_date,
      start_time: inserted.start_time ?? data.start_time,
      location: inserted.location,
      duration_hours: inserted.duration_hours ?? durationHours,
      guests: inserted.guests ?? data.guests,
      budget: inserted.budget,
      requirements: inserted.requirements,
      package_id: pkgRow.id,
      package_name: pkgRow.name,
      price: inserted.price ?? serverPrice,
      deposit_amount: inserted.deposit_amount ?? serverDeposit,
      status: "requested",
    },
  };
}

// ---------------------------------------------------------------------------
// 3. Booking Status Transitions (Prompt 6.1 & 6.2)
// ---------------------------------------------------------------------------

export type BookingMutationResult =
  | {
      ok: true;
      bookingId: string;
      status: DbBookingStatus;
      message: string;
    }
  | {
      ok: false;
      error: string;
      conflict?: boolean;
    };

/**
 * Transitions a booking through the enforced status flow:
 *   requested -> accepted | rejected | cancelled
 *   accepted -> deposit_paid (mock) | cancelled
 *   deposit_paid -> shoot_done | cancelled
 *   shoot_done -> delivered
 *   delivered -> completed
 *
 * Uses `validateBookingTransition()` from `lib/booking/transitions.ts` and
 * relies on the database unique index + triggers to prevent double-booking
 * and automatically mark the date as `booked` in `public.availability` when
 * a booking is accepted.
 */
export async function transitionBookingStatus(
  input: unknown
): Promise<BookingMutationResult> {
  const parsed = transitionBookingStatusSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error:
        parsed.error.issues[0]?.message ?? "Choose a valid booking action.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIGNED_OUT };

  const { booking_id, next_status, note } = parsed.data;

  const { data: booking, error: fetchError } = await supabase
    .from("bookings")
    .select(
      "id, client_id, photographer_id, event_date, event_type, status, proposal_note"
    )
    .eq("id", booking_id)
    .maybeSingle();

  if (fetchError || !booking) {
    return { ok: false, error: "We could not find that booking." };
  }

  let actor: BookingActorRole | null = null;
  if (booking.photographer_id === user.id) {
    actor = "photographer";
  } else if (booking.client_id === user.id) {
    actor = "client";
  }

  if (!actor) {
    return {
      ok: false,
      error: "You do not have permission to update this booking.",
    };
  }

  const check = validateBookingTransition({
    from: booking.status,
    to: next_status,
    actor,
  });

  if (!check.valid) {
    return { ok: false, error: check.error };
  }

  // Pre-check double booking before accepting so we can return a tailored message,
  // while the partial unique index `bookings_one_committed_per_photographer_date`
  // and `enforce_booking_update` trigger guarantee race-free enforcement in Postgres.
  if (next_status === "accepted" && booking.photographer_id) {
    const { data: existingCommitted } = await supabase
      .from("bookings")
      .select("id, event_type")
      .eq("photographer_id", booking.photographer_id)
      .eq("event_date", booking.event_date)
      .neq("id", booking.id)
      .in("status", [
        "accepted",
        "deposit_paid",
        "shoot_done",
        "delivered",
        "completed",
      ])
      .maybeSingle();

    if (existingCommitted) {
      return {
        ok: false,
        conflict: true,
        error: `Double-booking prevented: you already have a confirmed ${existingCommitted.event_type} shoot on ${booking.event_date}. Propose another date instead.`,
      };
    }
  }

  const updatePayload: {
    status: DbBookingStatus;
    proposal_note?: string | null;
  } = {
    status: next_status,
  };

  if (note !== null && note !== undefined) {
    updatePayload.proposal_note = note;
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update(updatePayload)
    .eq("id", booking.id);

  if (updateError) {
    if (
      updateError.code === "23505" ||
      updateError.message?.toLowerCase().includes("already booked")
    ) {
      return {
        ok: false,
        conflict: true,
        error: `Double-booking prevented: ${booking.event_date} is already booked for another shoot. Propose another date or decline this request.`,
      };
    }
    return {
      ok: false,
      error: updateError.message || TRY_AGAIN,
    };
  }

  revalidateBookingAndCalendarPaths(booking.photographer_id);

  const label = formatBookingStatusLabel(next_status);
  const message =
    next_status === "accepted"
      ? `Request accepted. ${booking.event_date} is now marked as booked on your calendar.`
      : next_status === "deposit_paid"
      ? "Mock deposit recorded. Your booking is now confirmed as deposit paid."
      : next_status === "shoot_done"
      ? "Shoot marked as done. Deliver the edited gallery when ready."
      : next_status === "delivered"
      ? "Booking marked as delivered. The client can now review and complete the booking."
      : next_status === "completed"
      ? "Booking completed. Thank you for booking through Momnt."
      : next_status === "rejected"
      ? "Booking request declined."
      : next_status === "cancelled"
      ? "Booking cancelled and calendar date released."
      : `Booking status updated to ${label.toLowerCase()}.`;

  return {
    ok: true,
    bookingId: booking.id,
    status: next_status,
    message,
  };
}

// ---------------------------------------------------------------------------
// 4. Photographer Counter-Proposal & Client Acceptance (Prompt 6.2)
// ---------------------------------------------------------------------------

export type CounterProposalResult =
  | {
      ok: true;
      bookingId: string;
      message: string;
    }
  | {
      ok: false;
      fieldErrors?: Partial<Record<ProposeBookingField, string>>;
      error: string;
    };

/**
 * Allows a photographer to propose another date and/or another package on a
 * `requested` booking without rejecting the client's inquiry.
 */
export async function proposeBookingAlternative(
  input: unknown
): Promise<CounterProposalResult> {
  const parsed = proposeBookingChangeSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors = toFieldErrors<ProposeBookingField>(parsed.error);
    return {
      ok: false,
      fieldErrors,
      error:
        parsed.error.issues[0]?.message ??
        "Choose a valid date or package to propose.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIGNED_OUT };

  const { booking_id, proposed_date, proposed_package_id, proposal_note } =
    parsed.data;

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, photographer_id, status, event_date, package_id")
    .eq("id", booking_id)
    .maybeSingle();

  if (!booking || booking.photographer_id !== user.id) {
    return {
      ok: false,
      error: "Only the photographer on this request can propose changes.",
    };
  }

  if (booking.status !== "requested") {
    return {
      ok: false,
      error: "Counter-proposals can only be sent while a request is pending.",
    };
  }

  // If a proposed date is provided, ensure the photographer isn't already committed on that date
  if (proposed_date) {
    const { data: conflictBooking } = await supabase
      .from("bookings")
      .select("id, event_type")
      .eq("photographer_id", user.id)
      .eq("event_date", proposed_date)
      .neq("id", booking.id)
      .in("status", [
        "accepted",
        "deposit_paid",
        "shoot_done",
        "delivered",
        "completed",
      ])
      .maybeSingle();

    if (conflictBooking) {
      return {
        ok: false,
        fieldErrors: {
          proposed_date: `You already have a confirmed ${conflictBooking.event_type} shoot on ${proposed_date}.`,
        },
        error: `You already have a confirmed booking on ${proposed_date}.`,
      };
    }
  }

  // If a proposed package is provided, ensure it belongs to this photographer
  if (proposed_package_id) {
    const { data: pkg } = await supabase
      .from("packages")
      .select("id")
      .eq("id", proposed_package_id)
      .eq("photographer_id", user.id)
      .maybeSingle();

    if (!pkg) {
      return {
        ok: false,
        fieldErrors: {
          proposed_package_id: "Select one of your own packages.",
        },
        error: "Select one of your own packages.",
      };
    }
  }

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      proposed_date,
      proposed_package_id,
      proposal_note,
    })
    .eq("id", booking.id);

  if (updateError) {
    return {
      ok: false,
      error: updateError.message || TRY_AGAIN,
    };
  }

  revalidateBookingAndCalendarPaths(user.id);
  return {
    ok: true,
    bookingId: booking.id,
    message:
      "Proposal sent to the client. They can accept the new terms or keep discussing.",
  };
}

/**
 * Allows the client to accept a photographer's counter-proposal (date and/or package).
 * The database trigger recalculates `price`, `deposit_amount`, and `duration_hours`
 * from the package on the server and clears the proposal fields.
 */
export async function acceptPhotographerProposal(
  input: unknown
): Promise<CounterProposalResult> {
  const parsed = acceptBookingProposalSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: "Select a valid booking proposal.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: SIGNED_OUT };

  const { data: booking } = await supabase
    .from("bookings")
    .select(
      "id, client_id, photographer_id, status, event_date, package_id, proposed_date, proposed_package_id"
    )
    .eq("id", parsed.data.booking_id)
    .maybeSingle();

  if (!booking || booking.client_id !== user.id) {
    return {
      ok: false,
      error: "Only the client on this booking can accept the proposal.",
    };
  }

  if (booking.status !== "requested") {
    return {
      ok: false,
      error: "This booking is no longer awaiting a proposal response.",
    };
  }

  if (!booking.proposed_date && !booking.proposed_package_id) {
    return {
      ok: false,
      error: "There is no active proposal on this booking.",
    };
  }

  const nextDate = booking.proposed_date ?? booking.event_date;
  const nextPackageId = booking.proposed_package_id ?? booking.package_id;

  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      event_date: nextDate,
      package_id: nextPackageId,
      proposed_date: null,
      proposed_package_id: null,
      proposal_note: null,
    })
    .eq("id", booking.id);

  if (updateError) {
    return {
      ok: false,
      error: updateError.message || TRY_AGAIN,
    };
  }

  revalidateBookingAndCalendarPaths(booking.photographer_id);
  return {
    ok: true,
    bookingId: booking.id,
    message:
      "Proposal accepted. Your booking request has been updated with the new schedule and package.",
  };
}

