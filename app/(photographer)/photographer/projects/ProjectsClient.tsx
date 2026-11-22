"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { EmptyState, PackageRow } from "@/components/patterns";
import { Button, Card, Chip, Stepper, Toast } from "@/components/ui";
import { transitionBookingStatus } from "@/lib/booking/actions";
import { BOOKING_RULES_CONFIG } from "@/lib/booking/config";
import type { EnrichedBookingItem } from "@/lib/booking/queries";
import {
  BOOKING_STEPPER_LABELS,
  bookingStatusChipVariant,
  bookingStatusStepIndex,
  formatBookingStatusLabel,
  getAvailableTransitions,
  type DbBookingStatus,
} from "@/lib/booking/transitions";
import { formatPackageDetail } from "@/lib/validators/packages";

type ToastState = {
  variant: "verified" | "alert";
  title: string;
  description?: string;
} | null;

export function ProjectsClient({
  initialBookings,
}: {
  initialBookings: EnrichedBookingItem[];
}) {
  const router = useRouter();
  const [bookings, setBookings] =
    useState<EnrichedBookingItem[]>(initialBookings);
  const [toast, setToast] = useState<ToastState>(null);
  const [isMutating, startMutating] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeProjects = bookings.filter((b) =>
    ["accepted", "deposit_paid", "shoot_done", "delivered"].includes(b.status)
  );
  const completedOrArchived = bookings.filter((b) =>
    ["completed", "cancelled", "rejected"].includes(b.status)
  );

  const handleTransition = (
    bk: EnrichedBookingItem,
    nextStatus: DbBookingStatus
  ) => {
    startMutating(async () => {
      const result = await transitionBookingStatus({
        booking_id: bk.id,
        next_status: nextStatus,
      });

      if (result.ok) {
        setBookings((prev) =>
          prev.map((item) =>
            item.id === bk.id ? { ...item, status: result.status } : item
          )
        );
        setToast({
          variant: "verified",
          title: `Updated to ${formatBookingStatusLabel(
            result.status
          ).toLowerCase()}`,
          description: result.message,
        });
      } else {
        setToast({
          variant: "alert",
          title: "Could not update project",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Active Projects Section */}
      <section aria-labelledby="active-projects-heading" className="space-y-4">
        <div className="flex items-baseline justify-between pb-3 border-b border-[#CFCFCB]">
          <h2
            id="active-projects-heading"
            className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
          >
            Upcoming &amp; in-progress shoots
          </h2>
          <span className="font-sans text-xs text-slate tabular-nums">
            {activeProjects.length} active
          </span>
        </div>

        {activeProjects.length === 0 ? (
          <EmptyState
            message="No active shoots in progress. Accept a pending request to add a project to your schedule."
            actionLabel="View pending requests"
            onAction={() => router.push("/photographer/requests")}
          />
        ) : (
          <div className="space-y-5" role="list">
            {activeProjects.map((bk) => {
              const transitions = getAvailableTransitions(
                bk.status,
                "photographer"
              );
              const detailLine = formatPackageDetail({
                hours: bk.package.hours,
                photographers: bk.package.photographers,
                editedPhotos: bk.package.editedPhotos,
                deliveryTime: bk.package.deliveryTime,
                addons: bk.package.addons,
              });

              return (
                <Card key={bk.id} role="listitem" className="p-6 space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="font-display text-[24px] leading-tight text-midnight">
                          {bk.eventType}, {bk.clientName}
                        </h3>
                        <Chip
                          variant={bookingStatusChipVariant(bk.status)}
                          size="sm"
                        >
                          {formatBookingStatusLabel(bk.status)}
                        </Chip>
                      </div>
                      <p className="font-sans text-sm text-slate tabular-nums">
                        {bk.eventDateLabel} &bull; {bk.startTimeLabel} &bull;{" "}
                        {bk.durationHours} hours &bull; {bk.guests} guests &bull;{" "}
                        {bk.location}
                      </p>
                    </div>

                    <div className="text-left sm:text-right font-sans tabular-nums shrink-0">
                      <div className="text-sm font-semibold text-midnight">
                        PKR {bk.price.toLocaleString()}
                      </div>
                      <div className="text-xs text-slate">
                        Deposit (25%): PKR {bk.depositAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Status Stepper */}
                  <div className="space-y-2 pt-2 border-t border-[#CFCFCB]">
                    <div className="flex items-center justify-between text-xs font-sans text-slate">
                      <span>Booking status path</span>
                      <span>
                        {bk.status === "accepted"
                          ? "Awaiting client mock deposit"
                          : bk.status === "deposit_paid"
                          ? "Ready for shoot day"
                          : bk.status === "shoot_done"
                          ? "Editing & gallery delivery"
                          : "Awaiting client completion"}
                      </span>
                    </div>
                    <Stepper
                      steps={[...BOOKING_STEPPER_LABELS]}
                      currentStep={bookingStatusStepIndex(bk.status)}
                    />
                  </div>

                  <div className="pt-2 border-t border-[#CFCFCB]">
                    <PackageRow
                      name={bk.package.name}
                      detail={detailLine}
                      price={bk.package.price}
                      className="p-0 border-b-0 hover:bg-transparent"
                    />
                  </div>

                  {bk.requirements && (
                    <div className="border-l-2 border-brass pl-3.5 py-0.5">
                      <p className="font-sans text-xs text-slate">
                        Shoot requirements
                      </p>
                      <p className="font-sans text-sm text-midnight">
                        {bk.requirements}
                      </p>
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#CFCFCB] flex flex-wrap items-center justify-between gap-3">
                    <p className="font-sans text-xs text-slate">
                      {BOOKING_RULES_CONFIG.shortSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      {transitions.map((tr) => {
                        const isPrimary = tr.to !== "cancelled";
                        return (
                          <Button
                            key={tr.to}
                            type="button"
                            variant={isPrimary ? "primary" : "secondary"}
                            size="sm"
                            loading={isMutating && isPrimary}
                            disabled={isMutating}
                            onClick={() => handleTransition(bk, tr.to)}
                          >
                            {tr.actionLabel}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Completed & Past History */}
      {completedOrArchived.length > 0 && (
        <section
          aria-labelledby="past-projects-heading"
          className="space-y-4 pt-2"
        >
          <div className="flex items-baseline justify-between pb-3 border-b border-[#CFCFCB]">
            <h2
              id="past-projects-heading"
              className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
            >
              Completed &amp; closed bookings
            </h2>
            <span className="font-sans text-xs text-slate tabular-nums">
              {completedOrArchived.length} total
            </span>
          </div>

          <div className="divide-y divide-[#CFCFCB] border border-[#CFCFCB] rounded-[2px] bg-chalk px-5">
            {completedOrArchived.map((bk) => (
              <div
                key={bk.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-sans text-sm font-medium text-midnight">
                    {bk.eventType}, {bk.clientName}
                  </div>
                  <div className="font-sans text-xs text-slate tabular-nums">
                    {bk.eventDateLabel} &bull; {bk.package.name} &bull; PKR{" "}
                    {bk.price.toLocaleString()}
                  </div>
                </div>
                <Chip variant={bookingStatusChipVariant(bk.status)} size="sm">
                  {formatBookingStatusLabel(bk.status)}
                </Chip>
              </div>
            ))}
          </div>
        </section>
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
