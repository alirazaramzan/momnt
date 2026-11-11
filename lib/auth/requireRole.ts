import "server-only";
import { redirect } from "next/navigation";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/database.types";
import {
  dashboardPathForRole,
  safeNextPath,
  signInPathWithReturn,
  type UserRole,
} from "@/lib/auth/roles";

/**
 * Server-side role checks for Server Components, Server Actions and Route
 * Handlers. proxy.ts already guards portal URLs; call these as well, close to
 * the data, because a proxy check alone is not authorisation.
 *
 * Both helpers read cookies, so in a page they must run inside a <Suspense>
 * boundary (Cache Components). redirect() throws, so never wrap a call to
 * requireRole in try/catch.
 */

export type VerificationStatus = Database["public"]["Enums"]["verification_status"];

export interface AuthContext {
  user: User;
  role: UserRole;
  supabase: SupabaseClient<Database>;
}

export interface RequireRoleOptions {
  /** Same-site path to come back to after signing in. Defaults to the first allowed role's dashboard. */
  returnTo?: string;
}

/**
 * Returns the signed-in user and their role, or redirects:
 *   signed out            -> /sign-in?next=<returnTo>
 *   signed in, no profile -> /
 *   signed in, wrong role -> their own dashboard
 */
export async function requireRole(
  allowed: UserRole | readonly UserRole[],
  options: RequireRoleOptions = {}
): Promise<AuthContext> {
  const roles: readonly UserRole[] = typeof allowed === "string" ? [allowed] : allowed;
  const returnTo = safeNextPath(options.returnTo) ?? dashboardPathForRole(roles[0]);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(signInPathWithReturn(returnTo));

  // Role comes from the database, never from the browser or user metadata.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role;

  if (!role) redirect("/");
  if (!roles.includes(role)) redirect(dashboardPathForRole(role));

  return { user, role, supabase };
}

// ---------------------------------------------------------------------------
// Photographer verification
// ---------------------------------------------------------------------------

/**
 * verification_status from photographer_profiles, plus two states the column
 * cannot express:
 *   not_started  no photographer_profiles row yet (profile not set up)
 *   unavailable  the read failed; show a retry message instead of crashing
 */
export type PhotographerVerificationState = VerificationStatus | "not_started" | "unavailable";

export interface PhotographerVerification {
  status: PhotographerVerificationState;
  /** Only true for "verified". Gate gig bids and public listing on this. */
  isVerified: boolean;
}

/** Copy for the verification banner, one line per state. */
export const VERIFICATION_NOTICE: Record<PhotographerVerificationState, string> = {
  verified:
    "Verified member. Profile listed on public discovery and eligible for gig marketplace bids.",
  pending:
    "Verification pending. Your profile stays off public discovery and gig bids until an admin verifies it.",
  under_review:
    "Your documents are under review. Your profile stays off public discovery and gig bids until the review is complete.",
  rejected:
    "Verification was not approved. Check your documents and submit them again to be listed.",
  not_started:
    "Your photographer profile is not set up yet. Complete it and submit verification to be listed.",
  unavailable:
    "We could not load your verification status. Refresh the page to try again.",
};

/**
 * Reads the signed-in photographer's verification_status. Never throws: a
 * missing row or a failed query comes back as a state the page can render.
 */
export async function getPhotographerVerification(
  ctx: Pick<AuthContext, "user" | "supabase">
): Promise<PhotographerVerification> {
  try {
    const { data, error } = await ctx.supabase
      .from("photographer_profiles")
      .select("verification_status")
      .eq("profile_id", ctx.user.id)
      .maybeSingle();

    if (error) return { status: "unavailable", isVerified: false };
    if (!data) return { status: "not_started", isVerified: false };
    return {
      status: data.verification_status,
      isVerified: data.verification_status === "verified",
    };
  } catch {
    return { status: "unavailable", isVerified: false };
  }
}

/** requireRole("photographer") plus the photographer's verification state. */
export async function requirePhotographer(
  options: RequireRoleOptions = {}
): Promise<AuthContext & { verification: PhotographerVerification }> {
  const ctx = await requireRole("photographer", options);
  const verification = await getPhotographerVerification(ctx);
  return { ...ctx, verification };
}

