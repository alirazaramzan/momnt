"use server";

import { randomUUID } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { toFieldErrors } from "@/lib/validators/auth";
import {
  PORTFOLIO_MAX_BYTES,
  PORTFOLIO_SIZE_MESSAGE,
  PORTFOLIO_TYPE_MESSAGE,
  deletePortfolioImageSchema,
  reorderPortfolioSchema,
  sniffImageType,
  updateCaptionSchema,
  type PortfolioImageRow,
  type PortfolioMutationResult,
  type UploadPortfolioResult,
} from "@/lib/validators/portfolio";

/**
 * Portfolio server actions for /photographer/portfolio.
 *
 * Every action verifies the signed-in user has role = 'photographer',
 * validates input with zod, and writes through the user's own Supabase
 * client so Row Level Security on `portfolio_images` and `storage.objects`
 * (`portfolio` bucket) applies.
 */

const TRY_AGAIN = "Something went wrong on our side. Try again in a moment.";
const SIGNED_OUT = "Your session has ended. Sign in again, then retry.";
const FORBIDDEN = "Only photographer accounts can manage a portfolio.";

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
 * inserting into `portfolio_images` (which references `photographer_profiles.profile_id`).
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

// ---------------------------------------------------------------------------
// Upload one or more portfolio images
// ---------------------------------------------------------------------------

export async function uploadPortfolioImages(
  formData: FormData
): Promise<UploadPortfolioResult> {
  const entries = formData.getAll("photos");
  const files = entries.filter((item): item is File => item instanceof File && item.size > 0);
  if (files.length === 0) {
    return { ok: false, error: "Choose at least one photo to upload" };
  }

  const { supabase, user, allowed } = await currentPhotographer();
  if (!user) return { ok: false, error: SIGNED_OUT };
  if (!allowed) return { ok: false, error: FORBIDDEN };

  const ready = await ensurePhotographerProfileRow(supabase, user.id);
  if (!ready) return { ok: false, error: TRY_AGAIN };

  // Find current highest sort_order so new frames append to the end.
  const { data: lastRow, error: orderError } = await supabase
    .from("portfolio_images")
    .select("sort_order")
    .eq("photographer_id", user.id)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (orderError) return { ok: false, error: TRY_AGAIN };

  let nextSortOrder = (lastRow?.sort_order ?? -1) + 1;
  const bucket = supabase.storage.from("portfolio");
  const added: PortfolioImageRow[] = [];
  const rejected: Array<{ name: string; reason: string }> = [];

  for (const file of files) {
    if (file.size > PORTFOLIO_MAX_BYTES) {
      rejected.push({ name: file.name, reason: PORTFOLIO_SIZE_MESSAGE });
      continue;
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const detected = sniffImageType(bytes);
    if (!detected) {
      rejected.push({ name: file.name, reason: PORTFOLIO_TYPE_MESSAGE });
      continue;
    }

    const storagePath = `${user.id}/${Date.now()}-${randomUUID().slice(0, 8)}.${detected.ext}`;
    const { error: uploadError } = await bucket.upload(storagePath, bytes, {
      contentType: detected.mime,
      cacheControl: "31536000",
      upsert: false,
    });
    if (uploadError) {
      rejected.push({ name: file.name, reason: TRY_AGAIN });
      continue;
    }

    const sortOrder = nextSortOrder++;
    const { data: inserted, error: insertError } = await supabase
      .from("portfolio_images")
      .insert({
        photographer_id: user.id,
        storage_path: storagePath,
        caption: null,
        sort_order: sortOrder,
      })
      .select("id, storage_path, caption, sort_order, created_at")
      .single();

    if (insertError || !inserted) {
      await bucket.remove([storagePath]);
      rejected.push({ name: file.name, reason: TRY_AGAIN });
      continue;
    }

    added.push({
      id: inserted.id,
      storage_path: inserted.storage_path,
      public_url: bucket.getPublicUrl(inserted.storage_path).data.publicUrl,
      caption: inserted.caption ?? "",
      sort_order: inserted.sort_order,
      created_at: inserted.created_at,
    });
  }

  if (added.length === 0) {
    const firstReason = rejected[0]?.reason ?? TRY_AGAIN;
    return { ok: false, error: firstReason, rejected };
  }

  return { ok: true, added, rejected };
}

// ---------------------------------------------------------------------------
// Update caption
// ---------------------------------------------------------------------------

export async function updatePortfolioCaption(
  input: unknown
): Promise<PortfolioMutationResult<"id" | "caption">> {
  const parsed = updateCaptionSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: toFieldErrors<"id" | "caption">(parsed.error),
    };
  }

  const { supabase, user, allowed } = await currentPhotographer();
  if (!user) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (!allowed) return { ok: false, fieldErrors: {}, formError: FORBIDDEN };

  const { id, caption } = parsed.data;
  const { data, error } = await supabase
    .from("portfolio_images")
    .update({ caption })
    .eq("id", id)
    .eq("photographer_id", user.id)
    .select("id");

  if (error || !data?.length) {
    return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  }
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Reorder portfolio images
// ---------------------------------------------------------------------------

export async function reorderPortfolioImages(
  input: unknown
): Promise<PortfolioMutationResult<"orderedIds">> {
  const parsed = reorderPortfolioSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: toFieldErrors<"orderedIds">(parsed.error),
    };
  }

  const { supabase, user, allowed } = await currentPhotographer();
  if (!user) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (!allowed) return { ok: false, fieldErrors: {}, formError: FORBIDDEN };

  const { orderedIds } = parsed.data;

  // Verify every ID belongs to this photographer before updating sort_order.
  const { data: ownedRows, error: fetchError } = await supabase
    .from("portfolio_images")
    .select("id")
    .eq("photographer_id", user.id);
  if (fetchError || !ownedRows) {
    return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  }

  const ownedSet = new Set(ownedRows.map((row) => row.id));
  if (
    orderedIds.length !== ownedSet.size ||
    orderedIds.some((id) => !ownedSet.has(id))
  ) {
    return {
      ok: false,
      fieldErrors: {},
      formError: "Your portfolio changed in another tab. Refresh this page and try again.",
    };
  }

  for (let index = 0; index < orderedIds.length; index++) {
    const { error: updateError } = await supabase
      .from("portfolio_images")
      .update({ sort_order: index })
      .eq("id", orderedIds[index])
      .eq("photographer_id", user.id);
    if (updateError) {
      return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
    }
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Delete portfolio image (removes both the database row and the storage file)
// ---------------------------------------------------------------------------

export async function deletePortfolioImage(
  input: unknown
): Promise<PortfolioMutationResult<"id">> {
  const parsed = deletePortfolioImageSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<"id">(parsed.error) };
  }

  const { supabase, user, allowed } = await currentPhotographer();
  if (!user) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (!allowed) return { ok: false, fieldErrors: {}, formError: FORBIDDEN };

  const { id } = parsed.data;

  // Delete the database row first and return its storage_path.
  const { data: deleted, error: deleteError } = await supabase
    .from("portfolio_images")
    .delete()
    .eq("id", id)
    .eq("photographer_id", user.id)
    .select("storage_path")
    .maybeSingle();

  if (deleteError || !deleted) {
    return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  }

  // Remove the underlying object from the portfolio bucket.
  const { error: storageError } = await supabase.storage
    .from("portfolio")
    .remove([deleted.storage_path]);
  if (storageError) {
    console.error("Portfolio row deleted, but storage remove failed:", storageError.message);
  }

  return { ok: true };
}

