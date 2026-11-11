import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";
import { dashboardPathForRole } from "@/lib/auth/roles";

/** Portal route prefixes. Each one belongs to the roles that land on it. */
const PORTALS = ["/client", "/photographer", "/vendor", "/admin"];

/**
 * Refreshes the Supabase auth session and writes updated cookies
 * to both the request (for this render) and the response (for the browser).
 * Called from the root proxy.ts on every matched request.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Do not add code between createServerClient and getUser().
  // getUser() revalidates the token with Supabase and triggers the refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Portal guard: signed-out users go to /sign-in; signed-in users can only
  // open the portal for their own role (role read from the database).
  const path = request.nextUrl.pathname;
  const portal = PORTALS.find((p) => path === p || path.startsWith(p + "/"));
  if (!portal) return response;

  if (!user) return redirectKeepingCookies(request, response, "/sign-in");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const home = dashboardPathForRole(profile?.role);
  if (home !== portal) return redirectKeepingCookies(request, response, home);

  return response;
}

/** Redirect while carrying over any refreshed session cookies. */
function redirectKeepingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
