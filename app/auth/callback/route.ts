import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { dashboardPathForRole, safeNextPath } from "@/lib/auth/roles";

/**
 * Landing route for links in Supabase auth emails (sign-up confirmation and
 * password reset). Supports both link styles:
 *   ?code=...                      PKCE (the default Supabase email template)
 *   ?token_hash=...&type=...       custom templates using {{ .TokenHash }}
 * On success the session cookie is set and the user is sent on:
 *   password reset  -> /reset-password
 *   ?next=/path     -> that same-site path
 *   otherwise       -> their dashboard, by role
 * On failure (expired or reused link) -> /sign-in?error=link
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  let next = safeNextPath(searchParams.get("next"));

  const supabase = await createClient();
  let verified = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    verified = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    verified = !error;
  }

  if (!verified) {
    return NextResponse.redirect(new URL("/sign-in?error=link", origin));
  }

  if (type === "recovery") next = "/reset-password";

  if (!next) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const { data: profile } = user
      ? await supabase.from("profiles").select("role").eq("id", user.id).single()
      : { data: null };
    next = dashboardPathForRole(profile?.role);
  }

  return NextResponse.redirect(new URL(next, origin));
}

