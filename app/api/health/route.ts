// TEMPORARY: Supabase connectivity check. Delete before deploying.
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

type CheckResult = "ok" | "fail";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const checks: { anon: CheckResult; service: CheckResult } = {
    anon: "fail",
    service: "fail",
  };

  // 1. URL and anon key reach Supabase Auth.
  if (url && anonKey) {
    try {
      const res = await fetch(`${url}/auth/v1/health`, {
        headers: { apikey: anonKey },
        cache: "no-store",
      });
      if (res.ok) checks.anon = "ok";
    } catch {
      // leave as fail
    }
  }

  // 2. Service role key is valid (server only).
  try {
    const admin = createAdminClient();
    const { error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    if (!error) checks.service = "ok";
  } catch {
    // leave as fail
  }

  const ok = checks.anon === "ok" && checks.service === "ok";
  return NextResponse.json({ ok, checks }, { status: ok ? 200 : 503 });
}
