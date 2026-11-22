"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { deleteAccountAndData } from "@/lib/account/delete-account";
import { toFieldErrors } from "@/lib/validators/auth";
import {
  AVATAR_MAX_BYTES,
  AVATAR_SIZE_MESSAGE,
  AVATAR_TYPE_MESSAGE,
  deleteAccountSchema,
  photographerProfileSchema,
  profileSchema,
  sniffImageType,
  type ActionResult,
  type AvatarUploadResult,
  type PhotographerProfileField,
  type ProfileField,
} from "@/lib/validators/profile";

/**
 * Profile settings server actions, shared by /client/settings,
 * /photographer/settings and /vendor/settings.
 *
 * Every action reads the user from the session (never from the browser),
 * validates input with zod, and writes through the user's own Supabase
 * client so Row Level Security applies. Only deleteAccount uses the service
 * role client, after the user has been confirmed.
 */

const TRY_AGAIN = "Something went wrong on our side. Try again in a moment.";
const SIGNED_OUT = "Your session has ended. Sign in again, then retry.";

async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, role: null } as const;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return { supabase, user, role: profile?.role ?? null } as const;
}

// ---------------------------------------------------------------------------
// Account details (profiles)
// ---------------------------------------------------------------------------

export async function updateProfile(input: unknown): Promise<ActionResult<ProfileField>> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<ProfileField>(parsed.error) };
  }

  const { supabase, user, role } = await currentUser();
  if (!user || !role) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };

  const { full_name, phone, city, business_name } = parsed.data;
  const { data, error } = await supabase
    .from("profiles")
    .update({
      full_name,
      phone,
      city,
      // Business name belongs to agency accounts only.
      ...(role === "agency" ? { business_name } : {}),
    })
    .eq("id", user.id)
    .select("id");

  if (error || !data?.length) return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  return { ok: true };
}

// ---------------------------------------------------------------------------
// Photographer profile (photographer_profiles)
// ---------------------------------------------------------------------------

export async function updatePhotographerProfile(
  input: unknown
): Promise<ActionResult<PhotographerProfileField>> {
  const parsed = photographerProfileSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      fieldErrors: toFieldErrors<PhotographerProfileField>(parsed.error),
    };
  }

  const { supabase, user, role } = await currentUser();
  if (!user) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (role !== "photographer") {
    return { ok: false, fieldErrors: {}, formError: "Only photographer accounts have this section." };
  }

  const { instagram, facebook, website, ...fields } = parsed.data;
  const social_links: Record<string, string> = {};
  if (instagram) social_links.instagram = instagram;
  if (facebook) social_links.facebook = facebook;
  if (website) social_links.website = website;

  // verification_status is never sent: new rows start as pending (RLS
  // insert policy) and only an admin changes it.
  const values = { ...fields, social_links };

  const { data: updated, error: updateError } = await supabase
    .from("photographer_profiles")
    .update(values)
    .eq("profile_id", user.id)
    .select("profile_id");
  if (updateError) return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };

  if (!updated?.length) {
    const { error: insertError } = await supabase
      .from("photographer_profiles")
      .insert({ profile_id: user.id, ...values });
    if (insertError) return { ok: false, fieldErrors: {}, formError: TRY_AGAIN };
  }

  return { ok: true };
}

// ---------------------------------------------------------------------------
// Avatar (Storage bucket "avatars", path {user_id}/avatar-{time}.{ext})
// ---------------------------------------------------------------------------

export async function uploadAvatar(formData: FormData): Promise<AvatarUploadResult> {
  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a photo to upload" };
  }
  if (file.size > AVATAR_MAX_BYTES) return { ok: false, error: AVATAR_SIZE_MESSAGE };

  // Trust the bytes, not the browser's file type.
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) return { ok: false, error: AVATAR_TYPE_MESSAGE };

  const { supabase, user } = await currentUser();
  if (!user) return { ok: false, error: SIGNED_OUT };

  // A new name each time, so browsers and the CDN never show the old photo.
  const path = `${user.id}/avatar-${Date.now()}.${type.ext}`;
  const avatars = supabase.storage.from("avatars");

  const { error: uploadError } = await avatars.upload(path, bytes, {
    contentType: type.mime,
    cacheControl: "31536000",
    upsert: false,
  });
  if (uploadError) return { ok: false, error: TRY_AGAIN };

  const avatarUrl = avatars.getPublicUrl(path).data.publicUrl;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);
  if (profileError) {
    await avatars.remove([path]);
    return { ok: false, error: TRY_AGAIN };
  }

  // Remove older avatars. If this fails the new photo is still saved.
  const { data: existing } = await avatars.list(user.id, { limit: 100 });
  const stale = (existing ?? [])
    .filter((item) => item.id && `${user.id}/${item.name}` !== path)
    .map((item) => `${user.id}/${item.name}`);
  if (stale.length > 0) await avatars.remove(stale);

  return { ok: true, avatarUrl };
}

// ---------------------------------------------------------------------------
// Account deletion
// ---------------------------------------------------------------------------

export async function deleteAccount(input: unknown): Promise<ActionResult<"confirmation">> {
  const parsed = deleteAccountSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, fieldErrors: toFieldErrors<"confirmation">(parsed.error) };
  }

  const { supabase, user, role } = await currentUser();
  if (!user || !role) return { ok: false, fieldErrors: {}, formError: SIGNED_OUT };
  if (role === "admin") {
    return { ok: false, fieldErrors: {}, formError: "Admin accounts cannot be deleted here." };
  }

  const outcome = await deleteAccountAndData(createAdminClient(), user.id);
  if (!outcome.ok) return { ok: false, fieldErrors: {}, formError: outcome.message };

  // The user no longer exists, so only clear the session cookies locally.
  await supabase.auth.signOut({ scope: "local" }).catch(() => undefined);
  redirect("/");
}

