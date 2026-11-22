import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

/**
 * Account deletion, shared by the deleteAccount server action and the test
 * script. Always called with the service role client, after the caller has
 * confirmed who the user is.
 *
 * What happens to each kind of data:
 *   * Profile, photographer profile, portfolio rows, packages, availability,
 *     notifications and verification requests: deleted with the auth user
 *     (ON DELETE CASCADE).
 *   * Open gigs and non-awarded bids: deleted here first, because no booking
 *     depends on them.
 *   * Finished bookings, closed or awarded gigs, awarded bids and reviews:
 *     kept, with the deleted person set to NULL (0005_account_deletion.sql).
 *   * Storage files (avatar, portfolio, CNIC scans, references of the deleted
 *     gigs): removed here, because foreign keys do not reach storage.
 *
 * Deletion is refused while the user has an active booking or an awarded gig
 * still in progress. The database enforces the same rule.
 */

type AdminClient = SupabaseClient<Database>;

export const ACTIVE_BOOKINGS_MESSAGE = "Finish or cancel your active bookings first.";
export const GIGS_IN_PROGRESS_MESSAGE =
  "Finish the bookings from your awarded gigs first.";
const TRY_AGAIN = "We could not delete your account. Try again in a moment.";

export type DeletionOutcome =
  | { ok: true; storageErrors: string[] }
  | { ok: false; reason: "blocked" | "error"; message: string };

export async function getDeletionBlocker(
  admin: AdminClient,
  userId: string
): Promise<{ blocked: false } | { blocked: true; message: string } | { error: true }> {
  const { data, error } = await admin.rpc("account_deletion_blockers", {
    p_user_id: userId,
  });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return { error: true };

  if (row.active_bookings > 0) return { blocked: true, message: ACTIVE_BOOKINGS_MESSAGE };
  if (row.gigs_in_progress > 0) return { blocked: true, message: GIGS_IN_PROGRESS_MESSAGE };
  return { blocked: false };
}

export async function deleteAccountAndData(
  admin: AdminClient,
  userId: string
): Promise<DeletionOutcome> {
  // 1. Guard.
  const blocker = await getDeletionBlocker(admin, userId);
  if ("error" in blocker) return { ok: false, reason: "error", message: TRY_AGAIN };
  if (blocker.blocked) return { ok: false, reason: "blocked", message: blocker.message };

  // 2. Bids that never became a booking.
  const { error: bidsError } = await admin
    .from("bids")
    .delete()
    .eq("photographer_id", userId)
    .neq("status", "awarded");
  if (bidsError) return { ok: false, reason: "error", message: TRY_AGAIN };

  // 3. Open gigs (their bids go with them). Closed, expired and awarded gigs
  //    stay for the photographers who bid, with client_id set to NULL.
  const { data: openGigs, error: openGigsError } = await admin
    .from("gigs")
    .delete()
    .eq("client_id", userId)
    .eq("status", "open")
    .select("id");
  if (openGigsError) return { ok: false, reason: "error", message: TRY_AGAIN };

  // 4. The auth user. Cascades and SET NULL do the rest in one transaction.
  //    The guard trigger re-checks, in case a booking was created meanwhile.
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    if (deleteError.message?.includes("Finish or cancel")) {
      return { ok: false, reason: "blocked", message: ACTIVE_BOOKINGS_MESSAGE };
    }
    return { ok: false, reason: "error", message: TRY_AGAIN };
  }

  // 5. Storage. Best effort: the account is already gone, so a failure here
  //    is logged for clean-up instead of shown to the person.
  const storageErrors: string[] = [];
  const folders: Array<[bucket: string, folder: string]> = [
    ["avatars", userId],
    ["portfolio", userId],
    ["verification-docs", userId],
    ...(openGigs ?? []).map((gig): [string, string] => ["gig-references", gig.id]),
  ];
  for (const [bucket, folder] of folders) {
    const error = await removeFolder(admin, bucket, folder);
    if (error) storageErrors.push(`${bucket}/${folder}: ${error}`);
  }
  if (storageErrors.length > 0) {
    console.error("Account deleted, but some files were not removed", storageErrors);
  }

  return { ok: true, storageErrors };
}

/** Removes every file directly inside {folder}/ of a bucket. */
async function removeFolder(
  admin: AdminClient,
  bucket: string,
  folder: string
): Promise<string | null> {
  // Each pass removes up to 100 files. The cap stops a loop if a removal
  // silently does nothing.
  for (let pass = 0; pass < 50; pass++) {
    const { data, error } = await admin.storage.from(bucket).list(folder, { limit: 100 });
    if (error) return error.message;
    // Sub-folders have no id. The folder conventions keep files at one level.
    const paths = (data ?? []).filter((item) => item.id).map((item) => `${folder}/${item.name}`);
    if (paths.length === 0) return null;
    const { error: removeError } = await admin.storage.from(bucket).remove(paths);
    if (removeError) return removeError.message;
  }
  return "too many files";
}

