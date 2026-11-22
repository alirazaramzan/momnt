import "server-only";
import { calculateDepositAmount } from "@/lib/booking/config";
import type { DbBookingStatus } from "@/lib/booking/transitions";
import { partyName } from "@/lib/profiles/display";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import {
  formatIsoDateHuman,
  formatSqlTimeHuman,
  type AvailabilityStatusValue,
} from "@/lib/validators/booking";
import {
  formatDeliveryDays,
  parsePackageAddons,
  type PackageAddon,
} from "@/lib/validators/packages";

export interface EnrichedBookingPackage {
  id: string | null;
  name: string;
  price: number;
  hours: number;
  photographers: number;
  editedPhotos: number;
  deliveryDays: number;
  deliveryTime: string;
  addons: PackageAddon[];
}

export interface EnrichedBookingItem {
  id: string;
  clientId: string | null;
  clientName: string;
  clientCity: string | null;
  photographerId: string | null;
  photographerName: string;
  photographerCity: string | null;
  photographerVerified: boolean;
  packageId: string | null;
  package: EnrichedBookingPackage;
  eventType: string;
  eventDate: string; // YYYY-MM-DD
  eventDateLabel: string; // e.g. "14 December 2026"
  eventDateShort: string; // e.g. "14 Dec 2026"
  startTime: string | null; // HH:MM:SS
  startTimeLabel: string; // e.g. "6:00 pm"
  location: string;
  durationHours: number;
  guests: number;
  budget: number | null;
  price: number; // Server package price in PKR
  depositAmount: number; // Server 25% deposit in PKR
  requirements: string | null;
  status: DbBookingStatus;
  proposedDate: string | null;
  proposedDateLabel: string | null;
  proposedPackageId: string | null;
  proposedPackage: EnrichedBookingPackage | null;
  proposalNote: string | null;
  sourceGigId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CalendarDateEntry {
  date: string; // YYYY-MM-DD
  status: AvailabilityStatusValue;
  lockedByBooking: boolean;
  bookingId?: string;
  bookingEvent?: string;
  bookingClientName?: string;
  bookingStatus?: DbBookingStatus;
}

export interface PhotographerOptionPackage {
  id: string;
  name: string;
  price: number;
  hours: number;
  photographers: number;
  editedPhotos: number;
  deliveryDays: number;
  deliveryTime: string;
}

function buildFallbackPackage(
  price: number,
  durationHours: number | null
): EnrichedBookingPackage {
  const hours = durationHours ?? 6;
  return {
    id: null,
    name: "Custom coverage",
    price,
    hours,
    photographers: 1,
    editedPhotos: 150,
    deliveryDays: 14,
    deliveryTime: "2 weeks",
    addons: [],
  };
}

/**
 * Enriches raw `public.bookings` rows with client names, photographer names,
 * verification badges, package details, and proposed package details.
 */
export async function enrichBookingRows(
  rows: Array<{
    id: string;
    client_id: string | null;
    photographer_id: string | null;
    package_id: string | null;
    event_type: string;
    event_date: string;
    start_time: string | null;
    location: string;
    duration_hours: number | null;
    guests: number | null;
    budget: number | null;
    price: number | null;
    deposit_amount: number | null;
    requirements: string | null;
    status: DbBookingStatus;
    proposed_date: string | null;
    proposed_package_id: string | null;
    proposal_note: string | null;
    source_gig_id: string | null;
    created_at: string;
    updated_at: string;
  }>
): Promise<EnrichedBookingItem[]> {
  if (rows.length === 0) return [];

  const supabase = await createClient();

  const packageIds = Array.from(
    new Set(
      rows
        .flatMap((r) => [r.package_id, r.proposed_package_id])
        .filter((id): id is string => Boolean(id))
    )
  );

  const profileIds = Array.from(
    new Set(
      rows
        .flatMap((r) => [r.client_id, r.photographer_id])
        .filter((id): id is string => Boolean(id))
    )
  );

  const photographerIds = Array.from(
    new Set(
      rows
        .map((r) => r.photographer_id)
        .filter((id): id is string => Boolean(id))
    )
  );

  // Load packages
  const packageMap = new Map<string, EnrichedBookingPackage>();
  if (packageIds.length > 0) {
    const { data: pkgRows } = await supabase
      .from("packages")
      .select(
        "id, name, price, hours, num_photographers, edited_photos, delivery_days, addons"
      )
      .in("id", packageIds);

    for (const pkg of pkgRows ?? []) {
      packageMap.set(pkg.id, {
        id: pkg.id,
        name: pkg.name,
        price: pkg.price,
        hours: pkg.hours,
        photographers: pkg.num_photographers,
        editedPhotos: pkg.edited_photos,
        deliveryDays: pkg.delivery_days,
        deliveryTime: formatDeliveryDays(pkg.delivery_days),
        addons: parsePackageAddons(pkg.addons),
      });
    }
  }

  // Load profiles and photographer verification via admin client (safe display fields only)
  // with fallback to profiles_public view if service role key is missing.
  const profileMap = new Map<
    string,
    { full_name: string | null; city: string | null }
  >();
  const verifiedMap = new Map<string, boolean>();

  try {
    const admin = createAdminClient();
    const [profRes, phRes] = await Promise.all([
      profileIds.length > 0
        ? admin
            .from("profiles")
            .select("id, full_name, city")
            .in("id", profileIds)
        : Promise.resolve({ data: [] }),
      photographerIds.length > 0
        ? admin
            .from("photographer_profiles")
            .select("profile_id, verification_status")
            .in("profile_id", photographerIds)
        : Promise.resolve({ data: [] }),
    ]);

    for (const p of profRes.data ?? []) {
      profileMap.set(p.id, { full_name: p.full_name, city: p.city });
    }
    for (const ph of phRes.data ?? []) {
      verifiedMap.set(ph.profile_id, ph.verification_status === "verified");
    }
  } catch {
    if (profileIds.length > 0) {
      const { data: pubProfiles } = await supabase
        .from("profiles_public")
        .select("id, full_name, city")
        .in("id", profileIds);
      for (const p of pubProfiles ?? []) {
        if (p.id) {
          profileMap.set(p.id, { full_name: p.full_name, city: p.city });
        }
      }
    }
  }

  return rows.map((row) => {
    const clientProf = row.client_id ? profileMap.get(row.client_id) : undefined;
    const phProf = row.photographer_id
      ? profileMap.get(row.photographer_id)
      : undefined;

    const pkg =
      (row.package_id ? packageMap.get(row.package_id) : undefined) ??
      buildFallbackPackage(row.price ?? row.budget ?? 0, row.duration_hours);

    const proposedPkg = row.proposed_package_id
      ? packageMap.get(row.proposed_package_id) ?? null
      : null;

    const effectivePrice = row.price ?? pkg.price;
    const effectiveDeposit =
      row.deposit_amount ?? calculateDepositAmount(effectivePrice);

    return {
      id: row.id,
      clientId: row.client_id,
      clientName: partyName(row.client_id, clientProf?.full_name),
      clientCity: clientProf?.city ?? null,
      photographerId: row.photographer_id,
      photographerName: partyName(row.photographer_id, phProf?.full_name),
      photographerCity: phProf?.city ?? null,
      photographerVerified: row.photographer_id
        ? verifiedMap.get(row.photographer_id) ?? true
        : false,
      packageId: row.package_id,
      package: pkg,
      eventType: row.event_type,
      eventDate: row.event_date,
      eventDateLabel: formatIsoDateHuman(row.event_date, "long"),
      eventDateShort: formatIsoDateHuman(row.event_date, "short"),
      startTime: row.start_time,
      startTimeLabel: formatSqlTimeHuman(row.start_time),
      location: row.location,
      durationHours: row.duration_hours ?? pkg.hours,
      guests: row.guests ?? 100,
      budget: row.budget,
      price: effectivePrice,
      depositAmount: effectiveDeposit,
      requirements: row.requirements,
      status: row.status,
      proposedDate: row.proposed_date,
      proposedDateLabel: row.proposed_date
        ? formatIsoDateHuman(row.proposed_date, "long")
        : null,
      proposedPackageId: row.proposed_package_id,
      proposedPackage: proposedPkg,
      proposalNote: row.proposal_note,
      sourceGigId: row.source_gig_id,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
}

/**
 * Loads all bookings for the signed-in client or agency user, newest event_date first.
 */
export async function loadClientBookings(): Promise<
  | {
      status: "ok";
      userId: string;
      userName: string;
      bookings: EnrichedBookingItem[];
    }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "error" }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profError || !profile) return { status: "error" };
  if (profile.role !== "client" && profile.role !== "agency") {
    return { status: "forbidden" };
  }

  const { data: rows, error: bookingsError } = await supabase
    .from("bookings")
    .select(
      "id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, price, deposit_amount, requirements, status, proposed_date, proposed_package_id, proposal_note, source_gig_id, created_at, updated_at"
    )
    .eq("client_id", user.id)
    .order("event_date", { ascending: true })
    .order("created_at", { ascending: false });

  if (bookingsError) return { status: "error" };

  const bookings = await enrichBookingRows(rows ?? []);
  return {
    status: "ok",
    userId: user.id,
    userName: profile.full_name?.trim() || "Momnt client",
    bookings,
  };
}

/**
 * Loads all bookings and packages for the signed-in photographer.
 */
export async function loadPhotographerBookingsAndPackages(): Promise<
  | {
      status: "ok";
      userId: string;
      userName: string;
      city: string | null;
      verificationStatus: "pending" | "under_review" | "verified" | "rejected";
      bookings: EnrichedBookingItem[];
      packages: PhotographerOptionPackage[];
    }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "error" }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("role, full_name, city")
    .eq("id", user.id)
    .single();

  if (profError || !profile) return { status: "error" };
  if (profile.role !== "photographer") return { status: "forbidden" };

  const [phProfileRes, bookingsRes, packagesRes] = await Promise.all([
    supabase
      .from("photographer_profiles")
      .select("verification_status")
      .eq("profile_id", user.id)
      .maybeSingle(),
    supabase
      .from("bookings")
      .select(
        "id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, price, deposit_amount, requirements, status, proposed_date, proposed_package_id, proposal_note, source_gig_id, created_at, updated_at"
      )
      .eq("photographer_id", user.id)
      .order("event_date", { ascending: true })
      .order("created_at", { ascending: false }),
    supabase
      .from("packages")
      .select(
        "id, name, price, hours, num_photographers, edited_photos, delivery_days"
      )
      .eq("photographer_id", user.id)
      .order("price", { ascending: true }),
  ]);

  if (bookingsRes.error || packagesRes.error) return { status: "error" };

  const bookings = await enrichBookingRows(bookingsRes.data ?? []);
  const packages: PhotographerOptionPackage[] = (packagesRes.data ?? []).map(
    (p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      hours: p.hours,
      photographers: p.num_photographers,
      editedPhotos: p.edited_photos,
      deliveryDays: p.delivery_days,
      deliveryTime: formatDeliveryDays(p.delivery_days),
    })
  );

  return {
    status: "ok",
    userId: user.id,
    userName: profile.full_name?.trim() || "Momnt photographer",
    city: profile.city,
    verificationStatus: phProfileRes.data?.verification_status ?? "pending",
    bookings,
    packages,
  };
}

/**
 * Loads the photographer's availability entries and committed bookings for the
 * calendar screen (/photographer/calendar).
 */
export async function loadPhotographerCalendarData(): Promise<
  | {
      status: "ok";
      userId: string;
      userName: string;
      entries: Record<string, CalendarDateEntry>;
      upcomingBookings: EnrichedBookingItem[];
    }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "error" }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: profile, error: profError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();

  if (profError || !profile) return { status: "error" };
  if (profile.role !== "photographer") return { status: "forbidden" };

  const [availRes, bookingsRes] = await Promise.all([
    supabase
      .from("availability")
      .select("date, status")
      .eq("photographer_id", user.id)
      .order("date", { ascending: true }),
    supabase
      .from("bookings")
      .select(
        "id, client_id, photographer_id, package_id, event_type, event_date, start_time, location, duration_hours, guests, budget, price, deposit_amount, requirements, status, proposed_date, proposed_package_id, proposal_note, source_gig_id, created_at, updated_at"
      )
      .eq("photographer_id", user.id)
      .in("status", [
        "accepted",
        "deposit_paid",
        "shoot_done",
        "delivered",
        "completed",
      ])
      .order("event_date", { ascending: true }),
  ]);

  if (availRes.error || bookingsRes.error) return { status: "error" };

  const enrichedBookings = await enrichBookingRows(bookingsRes.data ?? []);

  const entries: Record<string, CalendarDateEntry> = {};

  for (const row of availRes.data ?? []) {
    entries[row.date] = {
      date: row.date,
      status: row.status,
      lockedByBooking: false,
    };
  }

  for (const bk of enrichedBookings) {
    entries[bk.eventDate] = {
      date: bk.eventDate,
      status: "booked",
      lockedByBooking: true,
      bookingId: bk.id,
      bookingEvent: bk.eventType,
      bookingClientName: bk.clientName,
      bookingStatus: bk.status,
    };
  }

  return {
    status: "ok",
    userId: user.id,
    userName: profile.full_name?.trim() || "Momnt photographer",
    entries,
    upcomingBookings: enrichedBookings,
  };
}

