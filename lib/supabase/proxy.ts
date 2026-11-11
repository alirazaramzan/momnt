import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

/**
 * Refreshes the Supabase auth session and writes updated cookies
 * to both the request (for this render) and the response (for the browser).
 * Called from the root proxy.ts on every matched request.
 *
 * Returns the response to send on, plus the Supabase client and user so the
 * portal guard in proxy.ts can decide whether to redirect. Read `response`
 * after this resolves: it is replaced whenever cookies are refreshed.
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

  return { response, supabase, user };
}
