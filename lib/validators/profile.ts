import { z } from "zod";
import type { AuthActionResult } from "./auth";

/**
 * Profile settings schemas. Used by the server actions in
 * app/_settings/actions.ts. Role and verification_status are not part of
 * any schema, so they are stripped from whatever the browser sends.
 */

/** Same values as the event type filter on /photographers. */
export const SPECIALISATIONS = [
  "Weddings",
  "Portraits",
  "Editorial",
  "Corporate",
  "Traditional events",
] as const;

/** Same values as the style filter on /photographers. */
export const STYLES = [
  "Documentary",
  "Natural light",
  "Classic",
  "Fine art",
  "Editorial",
  "Cinematic",
] as const;

/** Matches the avatars bucket limits in 0004_gig_references_and_avatars.sql. */
export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const AVATAR_TYPE_MESSAGE = "Use a JPEG, PNG or WebP photo";
export const AVATAR_SIZE_MESSAGE = "Choose a photo under 5 MB";

export const DELETE_CONFIRMATION = "DELETE";

/** Text that may be left empty. Empty becomes null. */
function optionalText(max: number) {
  return z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value ?? "").trim())
    .pipe(z.string().max(max, { error: `Use ${max} characters or fewer` }))
    .transform((value) => (value === "" ? null : value));
}

/** A full http(s) link that may be left empty. */
function optionalUrl() {
  return optionalText(300).refine(
    (value) => {
      if (value === null) return true;
      try {
        const url = new URL(value);
        return url.protocol === "https:" || url.protocol === "http:";
      } catch {
        return false;
      }
    },
    { error: "Enter a full link starting with https://" }
  );
}

function uniqueList<const T extends readonly [string, ...string[]]>(options: T) {
  return z
    .array(z.enum(options, { error: "Choose from the list" }))
    .max(options.length)
    .default([])
    .transform((values) => Array.from(new Set(values)));
}

export const profileSchema = z.object({
  full_name: z
    .string({ error: "Enter your full name" })
    .trim()
    .min(2, { error: "Enter your full name" })
    .max(120, { error: "Use 120 characters or fewer" }),
  phone: optionalText(20).refine(
    (value) => value === null || /^\+?[0-9][0-9\s-]{6,18}$/.test(value),
    { error: "Enter a phone number like 0300 1234567" }
  ),
  city: optionalText(80),
  // Saved for agency accounts only. The action ignores it for other roles.
  business_name: optionalText(120),
});

export const photographerProfileSchema = z.object({
  bio: optionalText(1500),
  specializations: uniqueList(SPECIALISATIONS),
  styles: uniqueList(STYLES),
  years_experience: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((value) =>
      value === "" || value === null || value === undefined ? null : Number(value)
    )
    .pipe(
      z
        .number({ error: "Enter a whole number of years from 0 to 80" })
        .int({ error: "Enter a whole number of years from 0 to 80" })
        .min(0, { error: "Enter a whole number of years from 0 to 80" })
        .max(80, { error: "Enter a whole number of years from 0 to 80" })
        .nullable()
    ),
  is_videographer: z.boolean().default(false),
  instagram: optionalUrl(),
  facebook: optionalUrl(),
  website: optionalUrl(),
});

export const deleteAccountSchema = z.object({
  confirmation: z.literal(DELETE_CONFIRMATION, { error: "Type DELETE to confirm" }),
});

export type ProfileInput = z.input<typeof profileSchema>;
export type PhotographerProfileInput = z.input<typeof photographerProfileSchema>;
export type ProfileField = keyof z.input<typeof profileSchema>;
export type PhotographerProfileField = keyof z.input<typeof photographerProfileSchema>;

/** Same shape as the auth actions: field errors plus an optional form error. */
export type ActionResult<Field extends string> = AuthActionResult<Field>;

export type AvatarUploadResult =
  | { ok: true; avatarUrl: string }
  | { ok: false; error: string };

/**
 * Reads the real file type from the first bytes, so a renamed file cannot
 * pass as an image. Returns null for anything that is not JPEG, PNG or WebP.
 */
export function sniffImageType(
  bytes: Uint8Array
): { mime: (typeof AVATAR_TYPES)[number]; ext: string } | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return { mime: "image/jpeg", ext: "jpg" };
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  ) {
    return { mime: "image/png", ext: "png" };
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) {
    return { mime: "image/webp", ext: "webp" };
  }
  return null;
}

