"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canRoleAccessPath, dashboardPathForRole, safeNextPath } from "@/lib/auth/roles";
import {
  passwordResetRequestSchema,
  signInSchema,
  signUpSchema,
  toFieldErrors,
  updatePasswordSchema,
  type AuthActionResult,
} from "@/lib/validators/auth";

/**
 * Auth server actions for the sign-in, sign-up and reset-password screens.
 * Every input is validated with zod here, whatever the browser already checked.
 * On success these actions redirect. On failure they return field errors.
 */

const TRY_AGAIN = "Something went wrong on our side. Try again in a moment.";
const RATE_LIMITED = "Too many attempts. Wait a minute, then try again.";

/** Base URL used in email links. Must be listed in Supabase Auth redirect URLs. */
async function siteUrl(): Promise<string> {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (configured) return configured;
  const origin = (await headers()).get("origin");
  return origin ?? "http://localhost:3000";
}

// ---------------------------------------------------------------------------
// Sign up
// ---------------------------------------------------------------------------

type SignUpField = "full_name" | "email" | "password" | "role";

export async function signUp(input: unknown): Promise<AuthActionResult<SignUpField>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<SignUpField>(parsed.error) };
  }
  const { full_name, email, password, role } = parsed.data;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteUrl()}/auth/callback`,
      // Read by the handle_new_user trigger. The trigger also refuses "admin".
      data: { full_name, role },
    },
  });

  if (error) {
    switch (error.code) {
      case "weak_password":
        return { ok: false, fieldErrors: { password: "Choose a stronger password with letters and numbers" } };
      case "user_already_exists":
      case "email_exists":
        return { ok: false, fieldErrors: { email: "An account with this email already exists. Sign in instead." } };
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        return { ok: false, fieldErrors: {}, formError: RATE_LIMITED };
      default:
        return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
    }

  }

  // With email confirmation on, Supabase does not return an error for an
  // email that is already registered. It returns a placeholder user with no
  // identities instead, so treat that as a duplicate.
  if (data.user && data.user.identities?.length === 0) {
    return { ok: false, fieldErrors: { email: "An account with this email already exists. Sign in instead." } };
  }

  // With email confirmation on (required for Momnt), Supabase returns no
  // session until the link is opened.
  if (!data.session) {
    redirect("/sign-in?check=email");
  }
  redirect(dashboardPathForRole(role));
}

// ---------------------------------------------------------------------------
// Sign in
// ---------------------------------------------------------------------------

type SignInField = "email" | "password";

export async function signIn(input: unknown): Promise<AuthActionResult<SignInField>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<SignInField>(parsed.error) };
  }

  const supabase = await createClient();
  const { email, password, next } = parsed.data;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    switch (error.code) {
      case "email_not_confirmed":
        return { ok: false, fieldErrors: { email: "Confirm your email first. Open the link we sent to your inbox." } };
      case "invalid_credentials":
        return { ok: false, fieldErrors: { password: "Email or password is incorrect" } };
      case "over_request_rate_limit":
        return { ok: false, fieldErrors: {}, formError: RATE_LIMITED };
      default:
        return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
    }
  }

  // Role comes from the database, never from the browser.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  // Go back to the page that sent them to sign in, but only if it is a
  // same-site path this role may open. Otherwise use their dashboard.
  const returnTo = safeNextPath(next);
  redirect(
    returnTo && canRoleAccessPath(profile?.role, returnTo)
      ? returnTo
      : dashboardPathForRole(profile?.role)
  );
}

// ---------------------------------------------------------------------------
// Sign out
// ---------------------------------------------------------------------------

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/sign-in");
}

// ---------------------------------------------------------------------------
// Password reset: request a link
// ---------------------------------------------------------------------------

export async function requestPasswordReset(
  input: unknown
): Promise<AuthActionResult<"email">> {
  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<"email">(parsed.error) };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/reset-password`,
  });

  if (error?.code === "over_email_send_rate_limit" || error?.code === "over_request_rate_limit") {
    return { ok: false, fieldErrors: {}, formError: RATE_LIMITED };
  }

  // Same answer whether or not the account exists, so emails cannot be probed.
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Password reset: set the new password (user arrives signed in from the link)
// ---------------------------------------------------------------------------

export async function updatePassword(
  input: unknown
): Promise<AuthActionResult<"password">> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<"password">(parsed.error) };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      ok: false,
      fieldErrors: {},
      formError: "Your reset link has expired. Request a new one from the sign-in page.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    switch (error.code) {
      case "same_password":
        return { ok: false, fieldErrors: { password: "Choose a password you have not used here before" } };
      case "weak_password":
        return { ok: false, fieldErrors: { password: "Choose a stronger password with letters and numbers" } };
      default:
        return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  redirect(dashboardPathForRole(profile?.role));
}

