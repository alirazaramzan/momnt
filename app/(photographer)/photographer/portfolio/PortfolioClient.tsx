"use client";

import React, { useEffect, useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/patterns";
import { Button, Card, Chip, Input, Label, Toast } from "@/components/ui";
import {
  PORTFOLIO_MAX_BYTES,
  PORTFOLIO_SIZE_MESSAGE,
  PORTFOLIO_TYPES,
  PORTFOLIO_TYPE_MESSAGE,
  PORTFOLIO_VERIFICATION_MIN,
  PORTFOLIO_VERIFICATION_TARGET,
  type PortfolioImageRow,
} from "@/lib/validators/portfolio";
import {
  deletePortfolioImage,
  reorderPortfolioImages,
  updatePortfolioCaption,
  uploadPortfolioImages,
} from "./actions";
import type { PortfolioScreenData } from "./data";

type ToastState = {
  variant: "verified" | "alert";
  title: string;
  description?: string;
} | null;

/**
 * If a valid JPEG/PNG/WebP file exceeds 5 MB, renders it to an offscreen
 * canvas (scaling down to at most 2800 px on the longest edge) and encodes
 * as JPEG at decreasing quality levels until it fits under 5 MB.
 */
async function compressImageIfOverLimit(file: File): Promise<File | null> {
  if (file.size <= PORTFOLIO_MAX_BYTES) return file;

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);
      const maxDim = 2800;
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      for (const quality of [0.86, 0.76, 0.65, 0.52]) {
        const blob: Blob | null = await new Promise((res) =>
          canvas.toBlob(res, "image/jpeg", quality)
        );
        if (blob && blob.size <= PORTFOLIO_MAX_BYTES) {
          const baseName = file.name.replace(/\.[^.]+$/, "");
          resolve(
            new File([blob], `${baseName}.jpg`, {
              type: "image/jpeg",
              lastModified: Date.now(),
            })
          );
          return;
        }
      }
      resolve(null);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    img.src = objectUrl;
  });
}

export function PortfolioClient({ initial }: { initial: PortfolioScreenData }) {
  const [images, setImages] = useState<PortfolioImageRow[]>(initial.images);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [toast, setToast] = useState<ToastState>(null);

  const [isUploading, startUploading] = useTransition();
  const [isReordering, startReordering] = useTransition();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [captionErrors, setCaptionErrors] = useState<Record<string, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const count = images.length;
  const remainingForMin = Math.max(0, PORTFOLIO_VERIFICATION_MIN - count);
  const meetsVerificationMin = count >= PORTFOLIO_VERIFICATION_MIN;

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (selected.length === 0) return;

    startUploading(async () => {
      const localErrors: string[] = [];
      const readyFiles: File[] = [];
      let compressedCount = 0;

      for (const file of selected) {
        if (!(PORTFOLIO_TYPES as readonly string[]).includes(file.type)) {
          localErrors.push(`${file.name}: ${PORTFOLIO_TYPE_MESSAGE}`);
          continue;
        }
        if (file.size > PORTFOLIO_MAX_BYTES) {
          const compressed = await compressImageIfOverLimit(file);
          if (!compressed || compressed.size > PORTFOLIO_MAX_BYTES) {
            localErrors.push(`${file.name}: ${PORTFOLIO_SIZE_MESSAGE}`);
            continue;
          }
          compressedCount++;
          readyFiles.push(compressed);
        } else {
          readyFiles.push(file);
        }
      }

      if (readyFiles.length === 0) {
        setUploadErrors(localErrors);
        setToast({
          variant: "alert",
          title: "Photos not uploaded",
          description: localErrors[0] ?? PORTFOLIO_TYPE_MESSAGE,
        });
        return;
      }

      // Upload one file per server action call so multiple files near 5 MB
      // never exceed the 6 MB Server Action body limit.
      const newlyAdded: PortfolioImageRow[] = [];
      for (const file of readyFiles) {
        const formData = new FormData();
        formData.append("photos", file);
        const result = await uploadPortfolioImages(formData);
        if (result.ok) {
          newlyAdded.push(...result.added);
          for (const rej of result.rejected) {
            localErrors.push(`${rej.name}: ${rej.reason}`);
          }
        } else {
          localErrors.push(`${file.name}: ${result.error}`);
        }
      }

      setUploadErrors(localErrors);

      if (newlyAdded.length > 0) {
        setImages((current) => [...current, ...newlyAdded]);
        const compressedNote =
          compressedCount > 0
            ? ` (${compressedCount} compressed under 5 MB)`
            : "";
        setToast({
          variant: "verified",
          title:
            newlyAdded.length === 1
              ? `1 photo added${compressedNote}`
              : `${newlyAdded.length} photos added${compressedNote}`,
          description:
            localErrors.length > 0
              ? `${localErrors.length} file(s) could not be uploaded.`
              : undefined,
        });
      } else {
        setToast({
          variant: "alert",
          title: "Photos not uploaded",
          description: localErrors[0] ?? "Try again in a moment.",
        });
      }
    });
  };

  const handleMove = (index: number, direction: -1 | 1) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const previous = images;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    const reindexed = next.map((item, idx) => ({ ...item, sort_order: idx }));
    setImages(reindexed);

    startReordering(async () => {
      const result = await reorderPortfolioImages({
        orderedIds: reindexed.map((item) => item.id),
      });
      if (result.ok) {
        setToast({ variant: "verified", title: "Order saved" });
      } else {
        setImages(previous);
        setToast({
          variant: "alert",
          title: "Order not saved",
          description:
            result.fieldErrors.orderedIds ??
            result.formError ??
            "Try again in a moment.",
        });
      }
    });
  };

  const handleCaptionChange = (id: string, value: string) => {
    setImages((current) =>
      current.map((item) => (item.id === id ? { ...item, caption: value } : item))
    );
    if (captionErrors[id]) {
      setCaptionErrors((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  };

  const handleSaveCaption = async (id: string, caption: string) => {
    setSavingId(id);
    const result = await updatePortfolioCaption({ id, caption });
    setSavingId(null);

    if (result.ok) {
      setToast({ variant: "verified", title: "Caption saved" });
    } else {
      const fieldMsg = result.fieldErrors.caption ?? result.formError;
      if (fieldMsg) {
        setCaptionErrors((current) => ({ ...current, [id]: fieldMsg }));
      }
      setToast({
        variant: "alert",
        title: "Caption not saved",
        description: fieldMsg ?? "Try again in a moment.",
      });
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const result = await deletePortfolioImage({ id });
    setDeletingId(null);

    if (result.ok) {
      setImages((current) => current.filter((item) => item.id !== id));
      setToast({ variant: "verified", title: "Photo removed" });
    } else {
      setToast({
        variant: "alert",
        title: "Photo not removed",
        description:
          result.fieldErrors.id ?? result.formError ?? "Try again in a moment.",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Verification requirement & upload bar */}
      <Card className="p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-sans text-base font-semibold text-midnight">
              Verification requirement
            </h3>
            <p className="font-sans text-sm text-slate">
              {meetsVerificationMin
                ? `You have ${count} photos in your portfolio. Verification requires ${PORTFOLIO_VERIFICATION_MIN} to ${PORTFOLIO_VERIFICATION_TARGET} photos, and you can add more anytime.`
                : `Upload ${PORTFOLIO_VERIFICATION_MIN} to ${PORTFOLIO_VERIFICATION_TARGET} photos for verification (${remainingForMin} more needed to reach ${PORTFOLIO_VERIFICATION_MIN}). You can add more later.`}
            </p>
          </div>
          <div className="shrink-0">
            <Chip
              variant={meetsVerificationMin ? "verified" : "brass-outline"}
              className="tabular-nums"
            >
              {meetsVerificationMin
                ? `${count} photos · Ready for verification`
                : `${count} of ${PORTFOLIO_VERIFICATION_MIN} minimum`}
            </Chip>
          </div>
        </div>

        {/* Upload drop/click box */}
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            id="portfolio-upload-input"
            type="file"
            multiple
            accept={PORTFOLIO_TYPES.join(",")}
            onChange={handleFilesSelected}
            className="sr-only"
            tabIndex={-1}
          />
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload portfolio photos"
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            className="border border-dashed border-[#CFCFCB] hover:border-midnight/40 rounded-[2px] p-6 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight bg-mist/10 space-y-3"
          >
            <div className="space-y-1">
              <p className="font-sans text-sm font-medium text-midnight">
                Select photos to add to your portfolio
              </p>
              <p className="font-sans text-xs text-slate">
                JPEG, PNG or WebP, up to 5 MB each. Files over 5 MB are compressed automatically when possible.
              </p>
            </div>
            <div>
              <Button
                type="button"
                variant="primary"
                size="md"
                loading={isUploading}
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}
              >
                {isUploading ? "Uploading photos" : "Upload photos"}
              </Button>
            </div>
          </div>

          {uploadErrors.length > 0 && (
            <div
              role="alert"
              className="space-y-1 pt-1"
              aria-label="Upload errors"
            >
              {uploadErrors.map((err, idx) => (
                <p
                  key={idx}
                  className="text-xs text-alert font-medium font-sans leading-tight"
                >
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Portfolio grid or empty state */}
      {images.length === 0 ? (
        <EmptyState
          message="Your portfolio is empty. Upload at least 10 photos to prepare for verification."
          actionLabel="Upload photos"
          onAction={openFilePicker}
        />
      ) : (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          role="list"
          aria-label="Portfolio photos"
        >
          {images.map((image, index) => {
            const frameNumber = String(index + 1).padStart(3, "0");
            const isSavingCaption = savingId === image.id;
            const isDeleting = deletingId === image.id;
            const captionError = captionErrors[image.id];

            return (
              <Card
                key={image.id}
                role="listitem"
                className="p-4 flex flex-col justify-between space-y-4"
              >
                {/* Frame header: Frame number + credit + reorder / delete controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-sans text-xs text-slate tabular-nums">
                      No. {frameNumber} &middot; {initial.photographerName}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={index === 0 || isReordering || isDeleting}
                        onClick={() => handleMove(index, -1)}
                        aria-label={`Move frame ${frameNumber} earlier`}
                        className="px-2"
                      >
                        <ArrowUp className="size-3.5" strokeWidth={1.5} />
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={
                          index === images.length - 1 ||
                          isReordering ||
                          isDeleting
                        }
                        onClick={() => handleMove(index, 1)}
                        aria-label={`Move frame ${frameNumber} later`}
                        className="px-2"
                      >
                        <ArrowDown className="size-3.5" strokeWidth={1.5} />
                      </Button>
                      <Button
                        type="button"
                        variant="quiet"
                        size="sm"
                        loading={isDeleting}
                        disabled={isReordering}
                        onClick={() => handleDelete(image.id)}
                        aria-label={`Delete frame ${frameNumber}`}
                        className="px-2 text-slate hover:text-alert"
                      >
                        {!isDeleting && (
                          <Trash2 className="size-3.5" strokeWidth={1.5} />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Photograph: never tinted, filtered, or watermarked (AGENTS.md) */}
                  <div className="relative w-full aspect-[4/3] overflow-hidden rounded-[2px] border border-[#CFCFCB] bg-mist/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image.public_url}
                      alt={
                        image.caption
                          ? `${image.caption} by ${initial.photographerName}`
                          : `Portfolio frame ${frameNumber} by ${initial.photographerName}`
                      }
                      className="size-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Caption form */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveCaption(image.id, image.caption);
                  }}
                  className="space-y-2 pt-1 border-t border-[#CFCFCB]"
                  noValidate
                >
                  <Label htmlFor={`caption-${image.id}`} optional>
                    Caption
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={`caption-${image.id}`}
                      value={image.caption}
                      placeholder="Mehndi, Karachi, f/1.8"
                      maxLength={240}
                      onChange={(e) =>
                        handleCaptionChange(image.id, e.target.value)
                      }
                      aria-invalid={Boolean(captionError)}
                      aria-describedby={
                        captionError ? `caption-${image.id}-error` : undefined
                      }
                      className={
                        captionError
                          ? "border-alert focus-visible:outline-alert"
                          : undefined
                      }
                    />
                    <Button
                      type="submit"
                      variant="secondary"
                      size="md"
                      loading={isSavingCaption}
                      disabled={isDeleting}
                    >
                      Save
                    </Button>
                  </div>
                  {captionError && (
                    <p
                      id={`caption-${image.id}-error`}
                      role="alert"
                      className="text-xs text-alert font-medium font-sans leading-tight"
                    >
                      {captionError}
                    </p>
                  )}
                </form>
              </Card>
            );
          })}
        </div>
      )}

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

