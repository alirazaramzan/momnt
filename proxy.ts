import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";
import {
  canRoleAccessPath,
  dashboardPathForRole,
  portalForPath,
  signInPathWithReturn,
} from "@/lib/auth/roles";

// Next.js 16 replaces middleware.ts with proxy.ts.
// Refreshes the Supabase auth session on every request, then guards portals:
//   signed out            -> /sign-in?next=<the page they asked for>
//   signed in, wrong role -> their own dashboard
//   signed in, no profile -> the public home page (never a portal)
// Pages and server actions re-check with lib/auth/requireRole.ts, because
// the proxy is a first line of defence, not the only one.
export async function proxy(request: NextRequest) {
  const { response, supabase, user } = await updateSession(request);

  const { pathname, search } = request.nextUrl;
  if (!portalForPath(pathname)) return response;

  if (!user) {
    return redirectKeepingCookies(request, response, signInPathWithReturn(pathname + search));
  }

  // Role comes from the database, never from the browser or user metadata.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const role = profile?.role ?? null;

  if (!role) return redirectKeepingCookies(request, response, "/");
  if (!canRoleAccessPath(role, pathname)) {
    return redirectKeepingCookies(request, response, dashboardPathForRole(role));
  }

  return response;
}

/** Redirect to a same-site path (with optional query) while carrying over any refreshed session cookies. */
function redirectKeepingCookies(
  request: NextRequest,
  response: NextResponse,
  target: string
) {
  const redirect = NextResponse.redirect(new URL(target, request.url));
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
