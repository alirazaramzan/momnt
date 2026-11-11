import { z } from "zod";

/**
 * Auth input schemas. Used by the server actions in app/(auth)/actions.ts.
 * Messages match the copy the existing forms already show.
 */

/** Roles a person can choose at sign-up. "admin" is never accepted here. */
export const SIGNUP_ROLES = ["client", "agency", "photographer", "vendor"] as const;
export type SignupRole = (typeof SIGNUP_ROLES)[number];

const EMAIL_MESSAGE = "Enter an email like name@example.com";
const NEW_PASSWORD_MESSAGE = "Enter a password with at least 8 characters";

const email = z
  .string({ error: EMAIL_MESSAGE })
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: EMAIL_MESSAGE }));

const newPassword = z
  .string({ error: NEW_PASSWORD_MESSAGE })
  .min(8, { error: NEW_PASSWORD_MESSAGE })
  .max(72, { error: "Use a password of 72 characters or fewer" });

export const signUpSchema = z.object({
  full_name: z
    .string({ error: "Enter your full name" })
    .trim()
    .min(2, { error: "Enter your full name" })
    .max(120, { error: "Use 120 characters or fewer" }),
  email,
  password: newPassword,
  role: z.enum(SIGNUP_ROLES, { error: "Choose how you are joining" }),
});

export const signInSchema = z.object({
  email,
  password: z.string({ error: "Enter your password" }).min(1, { error: "Enter your password" }),
});

export const passwordResetRequestSchema = z.object({ email });

export const updatePasswordSchema = z.object({ password: newPassword });

export type SignUpInput = z.input<typeof signUpSchema>;
export type SignInInput = z.input<typeof signInSchema>;
export type PasswordResetRequestInput = z.input<typeof passwordResetRequestSchema>;
export type UpdatePasswordInput = z.input<typeof updatePasswordSchema>;

/**
 * Shape every auth action returns when it does not redirect.
 * fieldErrors holds one message per field, ready for FormField's `error` prop.
 * formError is for problems that are not tied to one field.
 */
export type AuthActionResult<Field extends string> =
  | { ok: true }
  | { ok: false; fieldErrors: Partial<Record<Field, string>>; formError?: string };

/** First zod message for each field. */
export function toFieldErrors<Field extends string>(
  error: z.ZodError
): Partial<Record<Field, string>> {
  const flattened = z.flattenError(error).fieldErrors as Record<string, string[] | undefined>;
  const result: Partial<Record<Field, string>> = {};
  for (const [field, messages] of Object.entries(flattened)) {
    if (messages?.[0]) result[field as Field] = messages[0];
  }
  return result;
}

