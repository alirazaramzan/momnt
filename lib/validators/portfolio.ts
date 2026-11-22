import { z } from "zod";
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  sniffImageType,
  type ActionResult,
} from "./profile";

/**
 * Portfolio input schemas and constants.
 * Used by app/(photographer)/photographer/portfolio/actions.ts and client UI.
 *
 * Limits match the `portfolio` storage bucket in 0003_storage.sql:
 * 5 MB per file, JPEG, PNG and WebP only.
 */

export const PORTFOLIO_MAX_BYTES = AVATAR_MAX_BYTES; // 5 MB
export const PORTFOLIO_TYPES = AVATAR_TYPES;
export const PORTFOLIO_TYPE_MESSAGE = "Use a JPEG, PNG or WebP photo";
export const PORTFOLIO_SIZE_MESSAGE = "Each photo must be under 5 MB";

/** Verification requires 10 to 20 frames; photographers can add more later. */
export const PORTFOLIO_VERIFICATION_MIN = 10;
export const PORTFOLIO_VERIFICATION_TARGET = 20;

export { sniffImageType };

const imageId = z.uuid({ error: "Select a valid portfolio photo" });

export const updateCaptionSchema = z.object({
  id: imageId,
  caption: z
    .string()
    .nullable()
    .optional()
    .transform((value) => (value ?? "").trim())
    .pipe(z.string().max(240, { error: "Use 240 characters or fewer" }))
    .transform((value) => (value === "" ? null : value)),
});

export const reorderPortfolioSchema = z.object({
  orderedIds: z
    .array(imageId)
    .min(1, { error: "Provide at least one photo to reorder" })
    .max(200, { error: "Too many photos in one reorder request" })
    .refine((ids) => new Set(ids).size === ids.length, {
      error: "Duplicate photo IDs in reorder list",
    }),
});

export const deletePortfolioImageSchema = z.object({
  id: imageId,
});

export type UpdateCaptionInput = z.input<typeof updateCaptionSchema>;
export type ReorderPortfolioInput = z.input<typeof reorderPortfolioSchema>;
export type DeletePortfolioImageInput = z.input<typeof deletePortfolioImageSchema>;

export interface PortfolioImageRow {
  id: string;
  storage_path: string;
  public_url: string;
  caption: string;
  sort_order: number;
  created_at: string;
}

export type UploadPortfolioResult =
  | {
      ok: true;
      added: PortfolioImageRow[];
      rejected: Array<{ name: string; reason: string }>;
    }
  | {
      ok: false;
      error: string;
      rejected?: Array<{ name: string; reason: string }>;
    };

export type PortfolioMutationResult<Field extends string = string> =
  ActionResult<Field>;
