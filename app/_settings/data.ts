import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/auth/roles";

/** What the settings screen needs for the signed-in user. */
export interface SettingsData {
  role: UserRole;
  profile: {
    full_name: string;
    phone: string;
    city: string;
    business_name: string;
    avatar_url: string | null;
  };
  /** Present for photographer accounts only. */
  photographer: {
    bio: string;
    specializations: string[];
    styles: string[];
    years_experience: string;
    is_videographer: boolean;
    instagram: string;
    facebook: string;
    website: string;
  } | null;
}

export type SettingsLoadResult =
  | { status: "ok"; data: SettingsData }
  | { status: "signed-out" }
  | { status: "error" };

function linkFrom(links: unknown, key: string): string {
  if (links && typeof links === "object" && !Array.isArray(links)) {
    const value = (links as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return "";
}

/** Reads profiles (and photographer_profiles) for the signed-in user. */
export async function loadSettings(): Promise<SettingsLoadResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { status: "signed-out" };

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name, phone, city, business_name, avatar_url")
    .eq("id", user.id)
    .single();
  if (error || !profile) return { status: "error" };

  let photographer: SettingsData["photographer"] = null;
  if (profile.role === "photographer") {
    const { data: row, error: photographerError } = await supabase
      .from("photographer_profiles")
      .select("bio, specializations, styles, years_experience, is_videographer, social_links")
      .eq("profile_id", user.id)
      .maybeSingle();
    if (photographerError) return { status: "error" };

    // No row yet: the first save creates it.
    photographer = {
      bio: row?.bio ?? "",
      specializations: row?.specializations ?? [],
      styles: row?.styles ?? [],
      years_experience: row?.years_experience?.toString() ?? "",
      is_videographer: row?.is_videographer ?? false,
      instagram: linkFrom(row?.social_links, "instagram"),
      facebook: linkFrom(row?.social_links, "facebook"),
      website: linkFrom(row?.social_links, "website"),
    };
  }

  return {
    status: "ok",
    data: {
      role: profile.role,
      profile: {
        full_name: profile.full_name ?? "",
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        business_name: profile.business_name ?? "",
        avatar_url: profile.avatar_url,
      },
      photographer,
    },
  };
}

