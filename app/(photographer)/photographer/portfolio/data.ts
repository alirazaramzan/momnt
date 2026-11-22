import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { VerificationStatus } from "@/lib/types";
import type { PortfolioImageRow } from "@/lib/validators/portfolio";

export interface PortfolioScreenData {
  userId: string;
  photographerName: string;
  verificationStatus: VerificationStatus;
  images: PortfolioImageRow[];
}

export type PortfolioLoadResult =
  | { status: "ok"; data: PortfolioScreenData }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "error" };

/**
 * Loads the signed-in photographer's portfolio images ordered by
 * sort_order ascending, then created_at ascending.
 */
export async function loadPortfolio(): Promise<PortfolioLoadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) return { status: "error" };
  if (profile.role !== "photographer") return { status: "forbidden" };

  const { data: photographerProfile, error: phError } = await supabase
    .from("photographer_profiles")
    .select("verification_status")
    .eq("profile_id", user.id)
    .maybeSingle();
  if (phError) return { status: "error" };

  const { data: rows, error: imagesError } = await supabase
    .from("portfolio_images")
    .select("id, storage_path, caption, sort_order, created_at")
    .eq("photographer_id", user.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  if (imagesError) return { status: "error" };

  const bucket = supabase.storage.from("portfolio");
  const images: PortfolioImageRow[] = (rows ?? []).map((row) => ({
    id: row.id,
    storage_path: row.storage_path,
    public_url: bucket.getPublicUrl(row.storage_path).data.publicUrl,
    caption: row.caption ?? "",
    sort_order: row.sort_order,
    created_at: row.created_at,
  }));

  return {
    status: "ok",
    data: {
      userId: user.id,
      photographerName: profile.full_name?.trim() || "Photographer",
      verificationStatus: photographerProfile?.verification_status ?? "pending",
      images,
    },
  };
}

