import "server-only";
import { createClient } from "@/lib/supabase/server";
import {
  parsePackageAddons,
  type PackageRowData,
} from "@/lib/validators/packages";

export interface PackagesScreenData {
  userId: string;
  packages: PackageRowData[];
}

export type PackagesLoadResult =
  | { status: "ok"; data: PackagesScreenData }
  | { status: "signed-out" }
  | { status: "forbidden" }
  | { status: "error" };

/**
 * Loads the signed-in photographer's packages ordered by price ascending,
 * then created_at ascending.
 */
export async function loadMyPackages(): Promise<PackagesLoadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profileError || !profile) return { status: "error" };
  if (profile.role !== "photographer") return { status: "forbidden" };

  const { data: rows, error: packagesError } = await supabase
    .from("packages")
    .select(
      "id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons, created_at, updated_at"
    )
    .eq("photographer_id", user.id)
    .order("price", { ascending: true })
    .order("created_at", { ascending: true });
  if (packagesError) return { status: "error" };

  const packages: PackageRowData[] = (rows ?? []).map((row) => ({
    id: row.id,
    photographer_id: row.photographer_id,
    name: row.name,
    price: row.price,
    hours: row.hours,
    num_photographers: row.num_photographers,
    edited_photos: row.edited_photos,
    delivery_days: row.delivery_days,
    addons: parsePackageAddons(row.addons),
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));

  return {
    status: "ok",
    data: {
      userId: user.id,
      packages,
    },
  };
}

