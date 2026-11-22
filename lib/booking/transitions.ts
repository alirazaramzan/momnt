import type { Database } from "@/lib/database.types";

export type DbBookingStatus = Database["public"]["Enums"]["booking_status"];

export type BookingActorRole = "client" | "photographer";

/**
 * Single source of truth for booking status transitions in Momnt.
 * Mirrors `public.enforce_booking_update()` in
 * `supabase/migrations/0007_availability_and_bookings.sql`.
 *
 * Main forward flow:
 *   requested -> accepted -> deposit_paid (mock) -> shoot_done -> delivered -> completed
 *
 * Terminal branch states:
 *   rejected  (photographer declines a requested booking)
 *   cancelled (client cancels requested/accepted/deposit_paid, or photographer cancels accepted/deposit_paid)
 */

export interface TransitionRule {
  from: DbBookingStatus;
  to: DbBookingStatus;
  allowedBy: readonly BookingActorRole[];
  actionLabel: string;
  description: string;
}

export const BOOKING_TRANSITION_RULES: readonly TransitionRule[] = [
  {
    from: "requested",
    to: "accepted",
    allowedBy: ["photographer"],
    actionLabel: "Accept request",
    description: "Confirm the date and mark it booked on your calendar.",
  },
  {
    from: "requested",
    to: "rejected",
    allowedBy: ["photographer"],
    actionLabel: "Decline request",
    description: "Decline this booking request.",
  },
  {
    from: "requested",
    to: "cancelled",
    allowedBy: ["client"],
    actionLabel: "Cancel request",
    description: "Withdraw this booking request before it is accepted.",
  },
  {
    from: "accepted",
    to: "deposit_paid",
    allowedBy: ["client"],
    actionLabel: "Pay deposit (mock)",
    description: "Record the 25% mock deposit to lock in your shoot.",
  },
  {
    from: "accepted",
    to: "cancelled",
    allowedBy: ["client", "photographer"],
    actionLabel: "Cancel booking",
    description: "Cancel this accepted booking and release the calendar date.",
  },
  {
    from: "deposit_paid",
    to: "shoot_done",
    allowedBy: ["photographer"],
    actionLabel: "Mark shoot done",
    description: "Confirm on-location photography has wrapped.",
  },
  {
    from: "deposit_paid",
    to: "cancelled",
    allowedBy: ["client", "photographer"],
    actionLabel: "Cancel booking",
    description: "Cancel this booking and release the calendar date.",
  },
  {
    from: "shoot_done",
    to: "delivered",
    allowedBy: ["photographer"],
    actionLabel: "Mark delivered",
    description: "Confirm edited photographs have been delivered to the client.",
  },
  {
    from: "delivered",
    to: "completed",
    allowedBy: ["client"],
    actionLabel: "Complete booking",
    description: "Confirm receipt of final photographs and close the booking.",
  },
] as const;

export const COMMITTED_BOOKING_STATUSES: readonly DbBookingStatus[] = [
  "accepted",
  "deposit_paid",
  "shoot_done",
  "delivered",
  "completed",
] as const;

export const TERMINAL_BOOKING_STATUSES: readonly DbBookingStatus[] = [
  "completed",
  "rejected",
  "cancelled",
] as const;

export const BOOKING_STEPPER_LABELS = [
  "Requested",
  "Accepted",
  "Deposit paid",
  "Shoot done",
  "Delivered",
  "Completed",
] as const;

/**
 * Validates whether a booking status transition is permitted for the given actor.
 * Returns `{ valid: true, rule }` or `{ valid: false, error }`.
 */
export function validateBookingTransition(params: {
  from: DbBookingStatus;
  to: DbBookingStatus;
  actor: BookingActorRole;
}):
  | { valid: true; rule: TransitionRule }
  | { valid: false; error: string } {
  const { from, to, actor } = params;

  if (from === to) {
    return {
      valid: false,
      error: `This booking is already marked as ${formatBookingStatusLabel(to).toLowerCase()}.`,
    };
  }

  const rule = BOOKING_TRANSITION_RULES.find(
    (r) => r.from === from && r.to === to
  );

  if (!rule) {
    return {
      valid: false,
      error: `A booking cannot move from ${formatBookingStatusLabel(
        from
      ).toLowerCase()} to ${formatBookingStatusLabel(to).toLowerCase()}.`,
    };
  }

  if (!rule.allowedBy.includes(actor)) {
    return {
      valid: false,
      error:
        actor === "client"
          ? "Only the photographer can make this status update."
          : "Only the client can make this status update.",
    };
  }

  return { valid: true, rule };
}

/**
 * Returns all valid next transitions that the specified actor (`client` or `photographer`)
 * can perform from the current status.
 */
export function getAvailableTransitions(
  currentStatus: DbBookingStatus,
  actor: BookingActorRole
): TransitionRule[] {
  return BOOKING_TRANSITION_RULES.filter(
    (r) => r.from === currentStatus && r.allowedBy.includes(actor)
  );
}

/**
 * Maps a `booking_status` enum value to a 0-based index for `<Stepper />`
 * using `BOOKING_STEPPER_LABELS`.
 */
export function bookingStatusStepIndex(status: DbBookingStatus): number {
  switch (status) {
    case "requested":
      return 0;
    case "accepted":
      return 1;
    case "deposit_paid":
      return 2;
    case "shoot_done":
      return 3;
    case "delivered":
      return 4;
    case "completed":
      return 5;
    case "rejected":
    case "cancelled":
      return 0;
  }
}

/**
 * Human-readable sentence-case label for any `booking_status`.
 */
export function formatBookingStatusLabel(status: DbBookingStatus): string {
  switch (status) {
    case "requested":
      return "Requested";
    case "accepted":
      return "Accepted";
    case "deposit_paid":
      return "Deposit paid";
    case "shoot_done":
      return "Shoot done";
    case "delivered":
      return "Delivered";
    case "completed":
      return "Completed";
    case "rejected":
      return "Declined";
    case "cancelled":
      return "Cancelled";
  }
}

/**
 * Chip variant for a booking status adhering to AGENTS.md brand colour tokens:
 * - verified green only for verified, paid, delivered, completed states
 * - alert red only for errors and rejected
 * - neutral / brass-outline for pending, accepted, cancelled
 */
export function bookingStatusChipVariant(
  status: DbBookingStatus
): "verified" | "alert" | "neutral" | "brass-outline" {
  switch (status) {
    case "deposit_paid":
    case "delivered":
    case "completed":
      return "verified";
    case "rejected":
      return "alert";
    case "requested":
      return "brass-outline";
    case "accepted":
    case "shoot_done":
    case "cancelled":
      return "neutral";
  }
}

