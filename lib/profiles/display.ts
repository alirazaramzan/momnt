/**
 * Display helpers for people on bookings, gigs, bids and reviews.
 *
 * When an account is deleted, its id on past bookings, gigs, bids and
 * reviews becomes NULL (0005_account_deletion.sql). Screens that list that
 * history should pass the id and name through partyName() so the row still
 * renders, as "Deleted user".
 */

export const DELETED_USER_LABEL = "Deleted user";

export function partyName(
  id: string | null | undefined,
  name: string | null | undefined
): string {
  if (!id) return DELETED_USER_LABEL;
  return name?.trim() || "Momnt member";
}

/** Two-letter initials for the Avatar fallback. */
export function initials(name: string | null | undefined): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "M";
  return parts.length === 1
    ? parts[0].slice(0, 2)
    : `${parts[0][0]}${parts[parts.length - 1][0]}`;
}

