/**
 * Central configuration for Momnt booking cancellation, rescheduling, and
 * deposit rules.
 *
 * Displayed on the public booking form (/book/[photographerId]), client
 * bookings screen (/client/bookings), and photographer requests/projects
 * screens (/photographer/requests, /photographer/projects).
 */

export interface BookingPolicyRule {
  id: string;
  label: string;
  detail: string;
}

export interface BookingRulesConfig {
  /** Deposit percentage (25% mock deposit, rounded to the nearest 1,000 PKR). */
  depositRatio: number;
  /** Days before the event date during which rescheduling is free. */
  freeRescheduleDaysBefore: number;
  /** Days before the event date during which cancellation refunds the deposit. */
  freeCancellationDaysBefore: number;
  /** Short one-line summary shown directly above the primary action button on /book/[photographerId]. */
  shortSummary: string;
  /** Detailed cancellation and rescheduling rules shown on booking cards and detail drawers. */
  rules: BookingPolicyRule[];
}

export const BOOKING_RULES_CONFIG: BookingRulesConfig = {
  depositRatio: 0.25,
  freeRescheduleDaysBefore: 14,
  freeCancellationDaysBefore: 14,
  shortSummary:
    "Free to reschedule or cancel up to 14 days before the event date. After that the 25% deposit is held for the reserved date.",
  rules: [
    {
      id: "reschedule",
      label: "Rescheduling",
      detail:
        "Free to move to another open date on the photographer's calendar up to 14 days before the shoot.",
    },
    {
      id: "cancellation-before-window",
      label: "Cancellation (14+ days before)",
      detail:
        "Cancelling while a request is pending or at least 14 days before the event date releases the hold with no penalty.",
    },
    {
      id: "cancellation-inside-window",
      label: "Cancellation (within 14 days)",
      detail:
        "If cancelled less than 14 days before the event date after the deposit is paid, the 25% deposit is retained to cover the held date.",
    },
    {
      id: "photographer-cancellation",
      label: "If the photographer cancels",
      detail:
        "If a photographer cancels an accepted booking, your full mock deposit is returned and Momnt assists with a verified replacement.",
    },
  ],
};

/**
 * Calculates the 25% mock deposit in whole PKR, rounded to the nearest 1,000 PKR
 * (or exact 25% when under 4,000 PKR).
 */
export function calculateDepositAmount(pricePkr: number): number {
  if (!Number.isFinite(pricePkr) || pricePkr <= 0) return 0;
  const raw = pricePkr * BOOKING_RULES_CONFIG.depositRatio;
  if (pricePkr < 4000) return Math.round(raw);
  return Math.round(raw / 1000) * 1000;
}

