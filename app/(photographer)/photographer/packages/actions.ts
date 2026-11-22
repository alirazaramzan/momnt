"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validators/auth";
import {
  deletePackageSchema,
  packageFieldsSchema,
  parsePackageAddons,
  updatePackageSchema,
  type PackageActionResult,
  type PackageField,
  type PackageRowData,
  type UpdatePackageField,
} from "@/lib/validators/packages";

/**
 * Package CRUD server actions for /photographer/packages.
 *
 * Every action checks the signed-in user has role = 'photographer',
 * validates inputs with zod (including positive integer PKR prices), and
 * writes through the user's own Supabase client so RLS enforces that only
 * the owner can insert, update or delete their packages.
 */

const TRY_AGAIN = "Something went wrong on our side. Try again in a moment.";
const SIGNED_OUT = "Your session has ended. Sign in again, then retry.";
const FORBIDDEN = "Only photographer accounts can manage packages.";

async function currentPhotographer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, allowed: false } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return {
    supabase,
    user,
    allowed: profile?.role === "photographer",
  } as const;
}

/**
 * Ensures the signed-in photographer has a `photographer_profiles` row before
 * inserting into `packages` (which references `photographer_profiles.profile_id`).
 */
async function ensurePhotographerProfileRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string
): Promise<boolean> {
  const { data: existing, error: selectError } = await supabase
    .from("photographer_profiles")
    .select("profile_id")
    .eq("profile_id", userId)
    .maybeSingle();
  if (selectError) return false;
  if (existing) return true;

  const { error: insertError } = await supabase
    .from("photographer_profiles")
    .insert({ profile_id: userId });
  return !insertError;
}

function toPackageRowData(row: {
  id: string;
  photographer_id: string;
  name: string;
  price: number;
  hours: number;
  num_photographers: number;
  edited_photos: number;
  delivery_days: number;
  addons: unknown;
  created_at: string;
  updated_at: string;
}): PackageRowData {
  return {
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
  };
}

function revalidatePublicPhotographerPages(photographerId: string) {
  revalidatePath(`/photographers/${photographerId}`);
  revalidatePath(`/book/${photographerId}`);
  revalidatePath("/photographers");
  revalidatePath("/photographer/packages");
}

// ---------------------------------------------------------------------------
// Create package
// ---------------------------------------------------------------------------

export async function createPackage(
  input: unknown
): Promise<PackageActionResult<PackageField>> {
  const parsed = packageFieldsSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: toFieldErrors<PackageField>(parsed.error),
    };
  }

  const { supabase, user, allowed } = await currentPhotographer();
  if (!user) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (!allowed) return { ok: false, fieldErrors: {}, formError: FORBIDDEN };

  const ready = await ensurePhotographerProfileRow(supabase, user.id);
  if (!ready) return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };

  const { data: inserted, error } = await supabase
    .from("packages")
    .insert({
      photographer_id: user.id,
      name: parsed.data.name,
      price: parsed.data.price,
      hours: parsed.data.hours,
      num_photographers: parsed.data.num_photographers,
      edited_photos: parsed.data.edited_photos,
      delivery_days: parsed.data.delivery_days,
      addons: parsed.data.addons,
    })
    .select(
      "id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons, created_at, updated_at"
    )
    .single();

  if (error || !inserted) {
    return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  }

  revalidatePublicPhotographerPages(user.id);
  return { ok: true, pkg: toPackageRowData(inserted) };
}

// ---------------------------------------------------------------------------
// Update package (owner only)
// ---------------------------------------------------------------------------

export async function updatePackage(
  input: unknown
): Promise<PackageActionResult<UpdatePackageField>> {
  const parsed = updatePackageSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: toFieldErrors<UpdatePackageField>(parsed.error),
    };
  }

  const { supabase, user, allowed } = await currentPhotographer();
  if (!user) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (!allowed) return { ok: false, fieldErrors: {}, formError: FORBIDDEN };

  const { id, ...values } = parsed.data;
  const { data: updated, error } = await supabase
    .from("packages")
    .update({
      name: values.name,
      price: values.price,
      hours: values.hours,
      num_photographers: values.num_photographers,
      edited_photos: values.edited_photos,
      delivery_days: values.delivery_days,
      addons: values.addons,
    })
    .eq("id", id)
    .eq("photographer_id", user.id)
    .select(
      "id, photographer_id, name, price, hours, num_photographers, edited_photos, delivery_days, addons, created_at, updated_at"
    )
    .maybeSingle();

  if (error || !updated) {
    return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  }

  revalidatePublicPhotographerPages(user.id);
  return { ok: true, pkg: toPackageRowData(updated) };
}

// ---------------------------------------------------------------------------
// Delete package (owner only)
// ---------------------------------------------------------------------------

export async function deletePackage(
  input: unknown
): Promise<PackageActionResult<"id">> {
  const parsed = deletePackageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<"id">(parsed.error) };
  }

  const { supabase, user, allowed } = await currentPhotographer();
  if (!user) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (!allowed) return { ok: false, fieldErrors: {}, formError: FORBIDDEN };

  const { data: deleted, error } = await supabase
    .from("packages")
    .delete()
    .eq("id", parsed.data.id)
    .eq("photographer_id", user.id)
    .select("id")
    .maybeSingle();

  if (error || !deleted) {
    return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  }

  revalidatePublicPhotographerPages(user.id);
  return { ok: true };
}

