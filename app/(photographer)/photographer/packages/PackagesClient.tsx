"use client";

import React, { useEffect, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { EmptyState, FormField, PackageRow } from "@/components/patterns";
import {
  Button,
  Card,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Toast,
} from "@/components/ui";
import {
  formatDeliveryDays,
  formatPackageDetail,
  packageAddonSchema,
  type PackageAddon,
  type PackageField,
  type PackageRowData,
} from "@/lib/validators/packages";
import { createPackage, deletePackage, updatePackage } from "./actions";
import type { PackagesScreenData } from "./data";

type ToastState = {
  variant: "verified" | "alert";
  title: string;
  description?: string;
} | null;

interface DraftAddon {
  name: string;
  price: string;
}

interface PackageFormState {
  id: string | null;
  name: string;
  price: string;
  hours: string;
  num_photographers: string;
  edited_photos: string;
  delivery_days: string;
  addons: DraftAddon[];
}

const EMPTY_FORM: PackageFormState = {
  id: null,
  name: "",
  price: "",
  hours: "6",
  num_photographers: "2",
  edited_photos: "250",
  delivery_days: "21",
  addons: [],
};

function rowToFormState(pkg: PackageRowData): PackageFormState {
  return {
    id: pkg.id,
    name: pkg.name,
    price: String(pkg.price),
    hours: String(pkg.hours),
    num_photographers: String(pkg.num_photographers),
    edited_photos: String(pkg.edited_photos),
    delivery_days: String(pkg.delivery_days),
    addons: pkg.addons.map((addon) => ({
      name: addon.name,
      price: String(addon.price),
    })),
  };
}

function sortByPrice(list: PackageRowData[]): PackageRowData[] {
  return [...list].sort(
    (a, b) => a.price - b.price || a.created_at.localeCompare(b.created_at)
  );
}

export function PackagesClient({ initial }: { initial: PackagesScreenData }) {
  const [packages, setPackages] = useState<PackageRowData[]>(initial.packages);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<PackageFormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<PackageField, string>>>({});
  const [addonErrors, setAddonErrors] = useState<Record<number, string>>({});
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>(null);

  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openCreateDialog = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setAddonErrors({});
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (pkg: PackageRowData) => {
    setForm(rowToFormState(pkg));
    setErrors({});
    setAddonErrors({});
    setFormError("");
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (isSaving) return;
    setDialogOpen(false);
  };

  const setField = (
    field: Exclude<keyof PackageFormState, "id" | "addons">,
    value: string
  ) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field as PackageField]) {
      setErrors((current) => ({ ...current, [field]: undefined }));
    }
    if (formError) setFormError("");
  };

  const addAddonRow = () => {
    setForm((current) => ({
      ...current,
      addons: [...current.addons, { name: "", price: "" }],
    }));
  };

  const updateAddonRow = (
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    setForm((current) => ({
      ...current,
      addons: current.addons.map((row, idx) =>
        idx === index ? { ...row, [field]: value } : row
      ),
    }));
    if (addonErrors[index]) {
      setAddonErrors((current) => {
        const next = { ...current };
        delete next[index];
        return next;
      });
    }
  };

  const removeAddonRow = (index: number) => {
    setForm((current) => ({
      ...current,
      addons: current.addons.filter((_, idx) => idx !== index),
    }));
    setAddonErrors({});
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate add-on rows locally first so each row can show its own message.
    const nextAddonErrors: Record<number, string> = {};
    const validAddons: PackageAddon[] = [];
    form.addons.forEach((row, index) => {
      if (!row.name.trim() && !row.price.trim()) return;
      const parsed = packageAddonSchema.safeParse({
        name: row.name,
        price: row.price,
      });
      if (!parsed.success) {
        nextAddonErrors[index] =
          parsed.error.issues[0]?.message ??
          "Enter an add-on name and positive PKR price";
      } else {
        validAddons.push(parsed.data);
      }
    });

    if (Object.keys(nextAddonErrors).length > 0) {
      setAddonErrors(nextAddonErrors);
      return;
    }

    const payload = {
      name: form.name,
      price: form.price,
      hours: form.hours,
      num_photographers: form.num_photographers,
      edited_photos: form.edited_photos,
      delivery_days: form.delivery_days,
      addons: validAddons,
    };

    startSaving(async () => {
      const result = form.id
        ? await updatePackage({ id: form.id, ...payload })
        : await createPackage(payload);

      if (result.ok && result.pkg) {
        const saved = result.pkg;
        setPackages((current) => {
          const filtered = current.filter((item) => item.id !== saved.id);
          return sortByPrice([...filtered, saved]);
        });
        setDialogOpen(false);
        setToast({
          variant: "verified",
          title: form.id ? "Package updated" : "Package created",
        });
      } else if (!result.ok) {
        setErrors(result.fieldErrors);
        setFormError(result.formError ?? "");
        setToast({
          variant: "alert",
          title: "Package not saved",
          description: result.formError ?? "Check the highlighted fields.",
        });
      }
    });
  };

  const handleDelete = async (pkg: PackageRowData) => {
    setDeletingId(pkg.id);
    const result = await deletePackage({ id: pkg.id });
    setDeletingId(null);

    if (result.ok) {
      setPackages((current) => current.filter((item) => item.id !== pkg.id));
      setToast({ variant: "verified", title: "Package deleted" });
    } else {
      setToast({
        variant: "alert",
        title: "Package not deleted",
        description:
          result.fieldErrors.id ?? result.formError ?? "Try again in a moment.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Top bar with primary Create package button */}
      <div className="flex items-center justify-between gap-4">
        <p className="font-sans text-xs text-slate tabular-nums">
          {packages.length} {packages.length === 1 ? "package" : "packages"}
        </p>
        <Button type="button" variant="primary" size="md" onClick={openCreateDialog}>
          <Plus className="size-4" strokeWidth={1.5} />
          Add package
        </Button>
      </div>

      {packages.length === 0 ? (
        <EmptyState
          message="You have not added any packages yet. Add a package so clients can request your dates."
          actionLabel="Add package"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-4" role="list" aria-label="Your packages">
          {packages.map((pkg) => {
            const isDeleting = deletingId === pkg.id;
            const detailLine = formatPackageDetail({
              hours: pkg.hours,
              photographers: pkg.num_photographers,
              editedPhotos: pkg.edited_photos,
              deliveryTime: formatDeliveryDays(pkg.delivery_days),
              addons: pkg.addons,
            });

            return (
              <Card key={pkg.id} role="listitem" className="p-5 space-y-4">
                <PackageRow
                  name={pkg.name}
                  detail={detailLine}
                  price={pkg.price}
                  className="p-0 border-b-0 hover:bg-transparent"
                />

                {pkg.addons.length > 0 && (
                  <div className="pt-3 border-t border-[#CFCFCB] space-y-1.5">
                    <div className="font-sans text-xs font-medium text-slate">
                      Add-ons
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {pkg.addons.map((addon, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 text-xs font-sans border border-[#CFCFCB] rounded-[2px] px-3 py-1.5"
                        >
                          <span className="text-midnight truncate">
                            {addon.name}
                          </span>
                          <span className="text-midnight font-medium tabular-nums shrink-0">
                            + PKR {addon.price.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-[#CFCFCB] flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={isDeleting}
                    onClick={() => openEditDialog(pkg)}
                  >
                    Edit package
                  </Button>
                  <Button
                    type="button"
                    variant="quiet"
                    size="sm"
                    loading={isDeleting}
                    onClick={() => handleDelete(pkg)}
                    className="text-slate hover:text-alert"
                  >
                    {!isDeleting && (
                      <Trash2 className="size-3.5" strokeWidth={1.5} />
                    )}
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit Package Dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(next) => (next ? setDialogOpen(true) : closeDialog())}
      >
        <DialogContent
          onClose={closeDialog}
          aria-labelledby="package-dialog-title"
          className="max-h-[90vh] overflow-y-auto"
        >
          <form onSubmit={handleSave} className="space-y-5" noValidate>
            <DialogHeader>
              <DialogTitle id="package-dialog-title">
                {form.id ? "Edit package" : "Add package"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate">
                Set coverage details and a whole PKR price. Clients select from these packages on your profile.
              </DialogDescription>
            </DialogHeader>

            {formError && (
              <p
                role="alert"
                className="text-xs text-alert font-medium font-sans leading-tight"
              >
                {formError}
              </p>
            )}

            <FormField
              id="pkg-name"
              label="Package name"
              error={errors.name}
              inputProps={{
                value: form.name,
                placeholder: "Mehndi coverage",
                onChange: (e) => setField("name", e.target.value),
              }}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                id="pkg-price"
                label="Price (PKR)"
                error={errors.price}
                inputProps={{
                  type: "number",
                  inputMode: "numeric",
                  min: 1,
                  step: 1,
                  value: form.price,
                  placeholder: "120000",
                  onChange: (e) => setField("price", e.target.value),
                  className: "tabular-nums",
                }}
              />

              <FormField
                id="pkg-hours"
                label="Hours of coverage"
                error={errors.hours}
                inputProps={{
                  type: "number",
                  inputMode: "numeric",
                  min: 1,
                  step: 1,
                  value: form.hours,
                  placeholder: "6",
                  onChange: (e) => setField("hours", e.target.value),
                  className: "tabular-nums",
                }}
              />

              <FormField
                id="pkg-photographers"
                label="Number of photographers"
                error={errors.num_photographers}
                inputProps={{
                  type: "number",
                  inputMode: "numeric",
                  min: 1,
                  step: 1,
                  value: form.num_photographers,
                  placeholder: "2",
                  onChange: (e) => setField("num_photographers", e.target.value),
                  className: "tabular-nums",
                }}
              />

              <FormField
                id="pkg-edited-photos"
                label="Edited photos"
                error={errors.edited_photos}
                inputProps={{
                  type: "number",
                  inputMode: "numeric",
                  min: 0,
                  step: 1,
                  value: form.edited_photos,
                  placeholder: "250",
                  onChange: (e) => setField("edited_photos", e.target.value),
                  className: "tabular-nums",
                }}
              />

              <FormField
                id="pkg-delivery-days"
                label="Delivery days"
                error={errors.delivery_days}
                inputProps={{
                  type: "number",
                  inputMode: "numeric",
                  min: 1,
                  step: 1,
                  value: form.delivery_days,
                  placeholder: "21",
                  onChange: (e) => setField("delivery_days", e.target.value),
                  className: "tabular-nums",
                }}
              />
            </div>

            {/* Add-ons builder */}
            <div className="space-y-3 pt-2 border-t border-[#CFCFCB]">
              <div className="flex items-center justify-between gap-2">
                <Label className="mb-0" optional>
                  Add-ons
                </Label>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={addAddonRow}
                >
                  Add add-on
                </Button>
              </div>

              {form.addons.length === 0 ? (
                <p className="font-sans text-xs text-slate">
                  Optional extras such as an extra hour, drone coverage, or a printed album.
                </p>
              ) : (
                <div className="space-y-3">
                  {form.addons.map((addon, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="grid grid-cols-[1fr_130px_auto] gap-2 items-center">
                        <Input
                          aria-label={`Add-on ${idx + 1} name`}
                          placeholder="Extra hour"
                          value={addon.name}
                          onChange={(e) =>
                            updateAddonRow(idx, "name", e.target.value)
                          }
                        />
                        <Input
                          type="number"
                          inputMode="numeric"
                          min={1}
                          step={1}
                          aria-label={`Add-on ${idx + 1} price in PKR`}
                          placeholder="PKR 15000"
                          value={addon.price}
                          onChange={(e) =>
                            updateAddonRow(idx, "price", e.target.value)
                          }
                          className="tabular-nums"
                        />
                        <Button
                          type="button"
                          variant="quiet"
                          size="sm"
                          onClick={() => removeAddonRow(idx)}
                          aria-label={`Remove add-on ${idx + 1}`}
                          className="px-2 text-slate hover:text-alert"
                        >
                          <Trash2 className="size-3.5" strokeWidth={1.5} />
                        </Button>
                      </div>
                      {addonErrors[idx] && (
                        <p
                          role="alert"
                          className="text-xs text-alert font-medium font-sans leading-tight"
                        >
                          {addonErrors[idx]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {errors.addons && (
                <p
                  role="alert"
                  className="text-xs text-alert font-medium font-sans leading-tight"
                >
                  {errors.addons}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={closeDialog}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" loading={isSaving}>
                {form.id ? "Save package" : "Create package"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toast region */}
      <div
        className="fixed bottom-20 md:bottom-6 right-6 left-6 sm:left-auto z-50 flex justify-end"
        aria-live="polite"
      >
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

