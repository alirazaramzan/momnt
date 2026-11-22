import { z } from "zod";
import type { ActionResult } from "./profile";

/**
 * Photographer package schemas and helpers.
 * Used by app/(photographer)/photographer/packages/actions.ts and public
 * profile / booking loaders.
 *
 * Money is stored as whole PKR in integer columns. Prices must be positive
 * integers (> 0) in PKR.
 */

const positiveInt = (message: string, max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .refine((value) => value !== "" && value !== null && value !== undefined, {
      error: message,
    })
    .transform((value) => Number(value))
    .pipe(
      z
        .number({ error: message })
        .int({ error: message })
        .positive({ error: message })
        .max(max, { error: `Enter ${max.toLocaleString()} or fewer` })
    );

const nonNegativeInt = (message: string, max: number) =>
  z
    .union([z.string(), z.number()])
    .transform((value) => (typeof value === "string" ? value.trim() : value))
    .refine((value) => value !== "" && value !== null && value !== undefined, {
      error: message,
    })
    .transform((value) => Number(value))
    .pipe(
      z
        .number({ error: message })
        .int({ error: message })
        .min(0, { error: message })
        .max(max, { error: `Enter ${max.toLocaleString()} or fewer` })
    );

export const packageAddonSchema = z.object({
  name: z
    .string({ error: "Enter an add-on name" })
    .trim()
    .min(2, { error: "Enter an add-on name" })
    .max(80, { error: "Use 80 characters or fewer" }),
  price: positiveInt("Enter a positive whole PKR price", 50_000_000),
});

export type PackageAddon = z.output<typeof packageAddonSchema>;

export const packageFieldsSchema = z.object({
  name: z
    .string({ error: "Enter a package name" })
    .trim()
    .min(2, { error: "Enter a package name" })
    .max(100, { error: "Use 100 characters or fewer" }),
  price: positiveInt("Enter a positive whole PKR price", 50_000_000),
  hours: positiveInt("Enter shoot hours (at least 1)", 168),
  num_photographers: positiveInt("Enter number of photographers (at least 1)", 50),
  edited_photos: nonNegativeInt("Enter edited photo count (0 or more)", 50_000),
  delivery_days: positiveInt("Enter delivery days (at least 1)", 365),
  addons: z
    .array(packageAddonSchema)
    .max(20, { error: "Add at most 20 add-ons per package" })
    .default([]),
});

export const updatePackageSchema = packageFieldsSchema.extend({
  id: z.uuid({ error: "Select a valid package" }),
});

export const deletePackageSchema = z.object({
  id: z.uuid({ error: "Select a valid package" }),
});

export type PackageInput = z.input<typeof packageFieldsSchema>;
export type UpdatePackageInput = z.input<typeof updatePackageSchema>;
export type PackageField = keyof z.input<typeof packageFieldsSchema>;
export type UpdatePackageField = keyof z.input<typeof updatePackageSchema>;

export interface PackageRowData {
  id: string;
  photographer_id: string;
  name: string;
  price: number;
  hours: number;
  num_photographers: number;
  edited_photos: number;
  delivery_days: number;
  addons: PackageAddon[];
  created_at: string;
  updated_at: string;
}

export type PackageActionResult<Field extends string = PackageField> =
  | { ok: true; pkg?: PackageRowData }
  | ({ ok: false } & Extract<ActionResult<Field>, { ok: false }>);

/** Parses `packages.addons` JSONB safely into a typed `PackageAddon[]`. */
export function parsePackageAddons(raw: unknown): PackageAddon[] {
  if (!Array.isArray(raw)) return [];
  const list: PackageAddon[] = [];
  for (const item of raw) {
    const parsed = packageAddonSchema.safeParse(item);
    if (parsed.success) list.push(parsed.data);
  }
  return list;
}

/** Human-readable delivery label for `Package.deliveryTime` (e.g. "14 days"). */
export function formatDeliveryDays(days: number): string {
  if (days === 1) return "1 day";
  if (days % 7 === 0) {
    const weeks = days / 7;
    return weeks === 1 ? "1 week" : `${weeks} weeks`;
  }
  return `${days} days`;
}

/** Detail line for `PackageRow` on profile and booking screens. */
export function formatPackageDetail(pkg: {
  hours: number;
  photographers: number;
  editedPhotos: number;
  deliveryTime: string;
  addons?: PackageAddon[];
}): string {
  const parts: string[] = [
    `${pkg.hours} ${pkg.hours === 1 ? "hour" : "hours"}`,
    `${pkg.photographers} ${pkg.photographers === 1 ? "photographer" : "photographers"}`,
  ];
  if (pkg.editedPhotos > 0) {
    parts.push(`${pkg.editedPhotos} edited`);
  }
  if (pkg.deliveryTime) {
    parts.push(`delivery in ${pkg.deliveryTime}`);
  }
  if (pkg.addons && pkg.addons.length > 0) {
    parts.push(
      `${pkg.addons.length} ${pkg.addons.length === 1 ? "add-on" : "add-ons"}`
    );
  }
  return parts.join(" · ");
}

