"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { FormField } from "@/components/patterns";
import {
  Avatar,
  Button,
  Card,
  Input,
  Label,
  Textarea,
  Toast,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui";
import { initials } from "@/lib/profiles/display";
import {
  AVATAR_MAX_BYTES,
  AVATAR_SIZE_MESSAGE,
  AVATAR_TYPES,
  AVATAR_TYPE_MESSAGE,
  DELETE_CONFIRMATION,
  SPECIALISATIONS,
  STYLES,
  type PhotographerProfileField,
  type ProfileField,
} from "@/lib/validators/profile";
import {
  deleteAccount,
  updatePhotographerProfile,
  updateProfile,
  uploadAvatar,
} from "./actions";
import type { SettingsData } from "./data";

type ToastState = { variant: "verified" | "alert"; title: string; description?: string } | null;

const checkboxClass =
  "size-4 rounded-[2px] border border-[#CFCFCB] accent-midnight cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight";

/**
 * Shared settings screen for clients, agencies, photographers and vendors.
 * Sections: account details (all), photographer profile (photographers),
 * danger zone (everyone except admins).
 */
export function SettingsClient({ initial }: { initial: SettingsData }) {
  const [toast, setToast] = useState<ToastState>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return (
    <div className="space-y-8 max-w-2xl">
      <AccountDetailsSection initial={initial} onToast={setToast} />
      {initial.role === "photographer" && initial.photographer && (
        <PhotographerSection initial={initial.photographer} onToast={setToast} />
      )}
      {initial.role !== "admin" && <DangerZoneSection />}

      <div className="fixed bottom-20 md:bottom-6 right-6 left-6 sm:left-auto z-50 flex justify-end" aria-live="polite">
        {toast && (
          <Toast
            variant={toast.variant}
            title={toast.title}
            description={toast.description}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Account details
// ---------------------------------------------------------------------------

function AccountDetailsSection({
  initial,
  onToast,
}: {
  initial: SettingsData;
  onToast: (toast: ToastState) => void;
}) {
  const [values, setValues] = useState(initial.profile);
  const [errors, setErrors] = useState<Partial<Record<ProfileField, string>>>({});
  const [isSaving, startSaving] = useTransition();

  const [avatarUrl, setAvatarUrl] = useState(initial.profile.avatar_url);
  const [preview, setPreview] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState("");
  const [isUploading, startUploading] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const isAgency = initial.role === "agency";

  const setField = (field: ProfileField, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      const result = await updateProfile({
        full_name: values.full_name,
        phone: values.phone,
        city: values.city,
        business_name: isAgency ? values.business_name : undefined,
      });
      if (result.ok) {
        setErrors({});
        onToast({ variant: "verified", title: "Details saved" });
      } else {
        setErrors(result.fieldErrors);
        onToast({
          variant: "alert",
          title: "Details not saved",
          description: result.formError ?? "Check the highlighted fields.",
        });
      }
    });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!(AVATAR_TYPES as readonly string[]).includes(file.type)) {
      setAvatarError(AVATAR_TYPE_MESSAGE);
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarError(AVATAR_SIZE_MESSAGE);
      return;
    }

    setAvatarError("");
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append("avatar", file);
    startUploading(async () => {
      const result = await uploadAvatar(formData);
      setPreview(null);
      if (result.ok) {
        setAvatarUrl(result.avatarUrl);
        onToast({ variant: "verified", title: "Photo updated" });
      } else {
        setAvatarError(result.error);
        onToast({ variant: "alert", title: "Photo not updated", description: result.error });
      }
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSave} className="space-y-6" noValidate>
        <h3 className="font-sans text-base font-semibold text-midnight">Account details</h3>

        {/* Avatar */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-4">
            <Avatar
              size="lg"
              src={preview ?? avatarUrl ?? undefined}
              alt={values.full_name ? `Profile photo of ${values.full_name}` : "Your profile photo"}
              fallback={initials(values.full_name)}
            />
            <div className="space-y-1">
              <input
                ref={fileInput}
                id="settings-avatar"
                type="file"
                accept={AVATAR_TYPES.join(",")}
                onChange={handleFile}
                className="sr-only"
                aria-describedby={avatarError ? "settings-avatar-error" : "settings-avatar-helper"}
                tabIndex={-1}
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                loading={isUploading}
                onClick={() => fileInput.current?.click()}
                aria-controls="settings-avatar"
              >
                {isUploading ? "Uploading photo" : "Change photo"}
              </Button>
              <p id="settings-avatar-helper" className="text-xs text-slate font-sans leading-tight">
                JPEG, PNG or WebP, up to 5 MB.
              </p>
            </div>
          </div>
          {avatarError && (
            <p
              id="settings-avatar-error"
              role="alert"
              className="text-xs text-alert font-medium font-sans leading-tight mt-1"
            >
              {avatarError}
            </p>
          )}
        </div>

        <FormField
          id="settings-full-name"
          label="Full name"
          error={errors.full_name}
          inputProps={{
            autoComplete: "name",
            value: values.full_name,
            onChange: (e) => setField("full_name", e.target.value),
          }}
        />

        <FormField
          id="settings-phone"
          label="Phone"
          optional
          error={errors.phone}
          inputProps={{
            type: "tel",
            autoComplete: "tel",
            inputMode: "tel",
            value: values.phone,
            placeholder: "0300 1234567",
            onChange: (e) => setField("phone", e.target.value),
          }}
        />

        <FormField
          id="settings-city"
          label="City"
          optional
          error={errors.city}
          inputProps={{
            autoComplete: "address-level2",
            value: values.city,
            placeholder: "Karachi",
            onChange: (e) => setField("city", e.target.value),
          }}
        />

        {isAgency && (
          <FormField
            id="settings-business-name"
            label="Business name"
            optional
            error={errors.business_name}
            inputProps={{
              autoComplete: "organization",
              value: values.business_name,
              onChange: (e) => setField("business_name", e.target.value),
            }}
          />
        )}

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={isSaving}>
            Save details
          </Button>
        </div>
      </form>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Photographer profile
// ---------------------------------------------------------------------------

function PhotographerSection({
  initial,
  onToast,
}: {
  initial: NonNullable<SettingsData["photographer"]>;
  onToast: (toast: ToastState) => void;
}) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<Partial<Record<PhotographerProfileField, string>>>({});
  const [isSaving, startSaving] = useTransition();

  const setField = <K extends keyof typeof values>(field: K, value: (typeof values)[K]) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (errors[field as PhotographerProfileField]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
  };

  const toggle = (field: "specializations" | "styles", option: string) => {
    const list = values[field];
    setField(field, list.includes(option) ? list.filter((item) => item !== option) : [...list, option]);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    startSaving(async () => {
      const result = await updatePhotographerProfile(values);
      if (result.ok) {
        setErrors({});
        onToast({ variant: "verified", title: "Profile saved" });
      } else {
        setErrors(result.fieldErrors);
        onToast({
          variant: "alert",
          title: "Profile not saved",
          description: result.formError ?? "Check the highlighted fields.",
        });
      }
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSave} className="space-y-6" noValidate>
        <h3 className="font-sans text-base font-semibold text-midnight">Photographer profile</h3>

        <FormField id="settings-bio" label="Bio" optional error={errors.bio}>
          <Textarea
            id="settings-bio"
            rows={5}
            value={values.bio}
            onChange={(e) => setField("bio", e.target.value)}
            aria-invalid={Boolean(errors.bio)}
            aria-describedby={errors.bio ? "settings-bio-error" : undefined}
            className={errors.bio ? "border-alert focus-visible:outline-alert" : undefined}
          />
        </FormField>

        <CheckboxGroup
          legend="Specialisations"
          name="specializations"
          options={SPECIALISATIONS}
          selected={values.specializations}
          onToggle={(option) => toggle("specializations", option)}
          error={errors.specializations}
        />

        <CheckboxGroup
          legend="Styles"
          name="styles"
          options={STYLES}
          selected={values.styles}
          onToggle={(option) => toggle("styles", option)}
          error={errors.styles}
        />

        <FormField
          id="settings-years"
          label="Years of experience"
          optional
          error={errors.years_experience}
          inputProps={{
            type: "number",
            inputMode: "numeric",
            min: 0,
            max: 80,
            step: 1,
            value: values.years_experience,
            onChange: (e) => setField("years_experience", e.target.value),
            className: "tabular-nums max-w-[160px]",
          }}
        />

        <label className="flex items-center gap-2.5 cursor-pointer select-none min-h-[44px]">
          <input
            id="settings-videographer"
            type="checkbox"
            checked={values.is_videographer}
            onChange={(e) => setField("is_videographer", e.target.checked)}
            className={checkboxClass}
          />
          <span className="font-sans text-sm font-medium text-midnight">I also shoot video</span>
        </label>

        <div className="space-y-4">
          <FormField
            id="settings-instagram"
            label="Instagram link"
            optional
            error={errors.instagram}
            inputProps={{
              type: "url",
              inputMode: "url",
              value: values.instagram,
              placeholder: "https://instagram.com/yourname",
              onChange: (e) => setField("instagram", e.target.value),
            }}
          />
          <FormField
            id="settings-facebook"
            label="Facebook link"
            optional
            error={errors.facebook}
            inputProps={{
              type: "url",
              inputMode: "url",
              value: values.facebook,
              placeholder: "https://facebook.com/yourpage",
              onChange: (e) => setField("facebook", e.target.value),
            }}
          />
          <FormField
            id="settings-website"
            label="Website"
            optional
            error={errors.website}
            inputProps={{
              type: "url",
              inputMode: "url",
              value: values.website,
              placeholder: "https://yourstudio.pk",
              onChange: (e) => setField("website", e.target.value),
            }}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" variant="primary" loading={isSaving}>
            Save profile
          </Button>
        </div>
      </form>
    </Card>
  );
}

function CheckboxGroup({
  legend,
  name,
  options,
  selected,
  onToggle,
  error,
}: {
  legend: string;
  name: string;
  options: readonly string[];
  selected: string[];
  onToggle: (option: string) => void;
  error?: string;
}) {
  return (
    <fieldset
      className="space-y-1.5"
      aria-describedby={error ? `settings-${name}-error` : undefined}
    >
      <legend className="block text-xs font-medium font-sans text-surface-secondary select-none mb-1.5">
        {legend}
        <span className="ml-1 text-slate font-normal">(optional)</span>
      </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2.5 cursor-pointer select-none min-h-[44px]"
          >
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selected.includes(option)}
              onChange={() => onToggle(option)}
              className={checkboxClass}
            />
            <span className="font-sans text-sm text-midnight">{option}</span>
          </label>
        ))}
      </div>
      {error && (
        <p
          id={`settings-${name}-error`}
          role="alert"
          className="text-xs text-alert font-medium font-sans leading-tight mt-1"
        >
          {error}
        </p>
      )}
    </fieldset>
  );
}

// ---------------------------------------------------------------------------
// Danger zone
// ---------------------------------------------------------------------------

function DangerZoneSection() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, startDeleting] = useTransition();

  const close = () => {
    if (isDeleting) return;
    setOpen(false);
    setConfirmation("");
    setError("");
  };

  const handleDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== DELETE_CONFIRMATION) return;
    startDeleting(async () => {
      // On success the action signs out and redirects to the home page.
      const result = await deleteAccount({ confirmation });
      if (!result.ok) {
        setError(result.fieldErrors.confirmation ?? result.formError ?? "Try again in a moment.");
      }
    });
  };

  return (
    <Card className="p-6 space-y-4">
      <div className="space-y-1">
        <h3 className="font-sans text-base font-semibold text-midnight">Danger zone</h3>
        <p className="font-sans text-sm text-slate">
          Deleting your account removes your profile and photos for good.
        </p>
      </div>
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={(next) => (next ? setOpen(true) : close())}>
        <DialogContent onClose={close} aria-labelledby="delete-account-title">
          <form onSubmit={handleDelete} noValidate>
            <DialogHeader>
              <DialogTitle id="delete-account-title">Delete your account</DialogTitle>
              <DialogDescription className="text-sm text-slate">
                This removes your profile, photos, packages and open gigs. Finished bookings stay
                in the other person&apos;s history as &ldquo;Deleted user&rdquo;. This cannot be
                undone.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="delete-confirmation">Type DELETE to confirm</Label>
              <Input
                id="delete-confirmation"
                value={confirmation}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                autoFocus
                onChange={(e) => {
                  setConfirmation(e.target.value);
                  if (error) setError("");
                }}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "delete-confirmation-error" : undefined}
                className={error ? "border-alert focus-visible:outline-alert" : undefined}
              />
              {error && (
                <p
                  id="delete-confirmation-error"
                  role="alert"
                  className="text-xs text-alert font-medium font-sans leading-tight mt-1"
                >
                  {error}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="secondary" onClick={close} disabled={isDeleting}>
                Keep my account
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={isDeleting}
                disabled={confirmation !== DELETE_CONFIRMATION}
              >
                Delete my account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

