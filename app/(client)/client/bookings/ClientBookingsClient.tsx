"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { VerifiedBadge } from "@/components/brand";
import { EmptyState, PackageRow } from "@/components/patterns";
import { Button, Card, Chip, Stepper, Toast } from "@/components/ui";
import {
  acceptPhotographerProposal,
  transitionBookingStatus,
} from "@/lib/booking/actions";
import {
  BOOKING_RULES_CONFIG,
  calculateDepositAmount,
} from "@/lib/booking/config";
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

export function ClientBookingsClient({
  initialBookings,
}: {
  initialBookings: EnrichedBookingItem[];
}) {
  const router = useRouter();
  const [bookings, setBookings] =
    useState<EnrichedBookingItem[]>(initialBookings);
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [isMutating, startMutating] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeBookings = bookings.filter(
    (b) => !["completed", "cancelled", "rejected"].includes(b.status)
  );
  const pastBookings = bookings.filter((b) =>
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
          title:
            nextStatus === "deposit_paid"
              ? "Mock deposit paid"
              : nextStatus === "completed"
              ? "Booking completed"
              : `Booking ${formatBookingStatusLabel(
                  result.status
                ).toLowerCase()}`,
          description: result.message,
        });
      } else {
        setToast({
          variant: "alert",
          title: "Could not update booking",
          description: result.error,
        });
      }
    });
  };

  const handleAcceptProposal = (bk: EnrichedBookingItem) => {
    startMutating(async () => {
      const result = await acceptPhotographerProposal({
        booking_id: bk.id,
      });

      if (result.ok) {
        setBookings((prev) =>
          prev.map((item) => {
            if (item.id !== bk.id) return item;
            const nextPkg = item.proposedPackage ?? item.package;
            const nextPrice = nextPkg.price;
            const nextDeposit = calculateDepositAmount(nextPrice);
            return {
              ...item,
              eventDate: item.proposedDate ?? item.eventDate,
              eventDateLabel: item.proposedDateLabel ?? item.eventDateLabel,
              packageId: item.proposedPackageId ?? item.packageId,
              package: nextPkg,
              price: nextPrice,
              depositAmount: nextDeposit,
              durationHours: nextPkg.hours,
              proposedDate: null,
              proposedDateLabel: null,
              proposedPackageId: null,
              proposedPackage: null,
              proposalNote: null,
            };
          })
        );
        setToast({
          variant: "verified",
          title: "Proposal accepted",
          description: result.message,
        });
      } else {
        setToast({
          variant: "alert",
          title: "Could not accept proposal",
          description: result.error,
        });
      }
    });
  };

  return (
    <div className="space-y-10 max-w-4xl">
      {/* Cancellation & Rescheduling Policy Banner */}
      <Card className="p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-sans text-sm font-semibold text-midnight">
              Cancellation &amp; rescheduling rules
            </h2>
            <p className="font-sans text-xs text-slate mt-0.5">
              {BOOKING_RULES_CONFIG.shortSummary}
            </p>
          </div>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={() => setShowRulesModal(!showRulesModal)}
            className="self-start sm:self-auto shrink-0"
          >
            {showRulesModal ? "Hide policy details" : "View full policy"}
          </Button>
        </div>

        {showRulesModal && (
          <div className="pt-3 border-t border-[#CFCFCB] grid grid-cols-1 sm:grid-cols-2 gap-3">
            {BOOKING_RULES_CONFIG.rules.map((rule) => (
              <div
                key={rule.id}
                className="border border-[#CFCFCB] rounded-[2px] p-3 space-y-1"
              >
                <div className="font-sans text-xs font-semibold text-midnight">
                  {rule.label}
                </div>
                <p className="font-sans text-xs text-slate leading-relaxed">
                  {rule.detail}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Active Bookings */}
      <section aria-labelledby="active-bookings-heading" className="space-y-4">
        <div className="flex items-baseline justify-between pb-3 border-b border-[#CFCFCB]">
          <h2
            id="active-bookings-heading"
            className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
          >
            Active bookings &amp; requests
          </h2>
          <span className="font-sans text-xs text-slate tabular-nums">
            {activeBookings.length} active
          </span>
        </div>

        {activeBookings.length === 0 ? (
          <EmptyState
            message="You have no active bookings right now. Browse verified photographers to request a date."
            actionLabel="Find a photographer"
            onAction={() => router.push("/photographers")}
          />
        ) : (
          <div className="space-y-5" role="list">
            {activeBookings.map((bk) => {
              const transitions = getAvailableTransitions(bk.status, "client");
              const hasProposal = Boolean(
                bk.proposedDate || bk.proposedPackageId
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
                          {bk.eventType} with {bk.photographerName}
                        </h3>
                        {bk.photographerVerified && (
                          <VerifiedBadge variant="solid" />
                        )}
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
                        Deposit (25% mock): PKR{" "}
                        {bk.depositAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Counter-Proposal Banner from Photographer */}
                  {hasProposal && bk.status === "requested" && (
                    <div className="border border-brass rounded-[2px] p-4 space-y-3 bg-chalk">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="font-sans text-xs font-semibold text-midnight">
                            {bk.photographerName} proposed an alternative
                          </span>
                          <p className="font-sans text-xs text-slate tabular-nums mt-0.5">
                            {bk.proposedDateLabel
                              ? `New date: ${bk.proposedDateLabel}`
                              : `Date: ${bk.eventDateLabel}`}
                            {bk.proposedPackage
                              ? ` · New package: ${bk.proposedPackage.name} (PKR ${bk.proposedPackage.price.toLocaleString()})`
                              : ""}
                          </p>
                        </div>
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          loading={isMutating}
                          onClick={() => handleAcceptProposal(bk)}
                        >
                          Accept proposed terms
                        </Button>
                      </div>
                      {bk.proposalNote && (
                        <p className="font-sans text-xs text-midnight border-l-2 border-brass pl-3">
                          &ldquo;{bk.proposalNote}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Stepper */}
                  <div className="space-y-2 pt-2 border-t border-[#CFCFCB]">
                    <div className="flex items-center justify-between text-xs font-sans text-slate">
                      <span>Booking status path</span>
                      <span>
                        {bk.status === "requested"
                          ? "Awaiting photographer confirmation"
                          : bk.status === "accepted"
                          ? `Pay PKR ${bk.depositAmount.toLocaleString()} mock deposit to confirm`
                          : bk.status === "deposit_paid"
                          ? "Deposit paid · Confirmed on calendar"
                          : bk.status === "shoot_done"
                          ? "Shoot complete · Gallery in editing"
                          : "Gallery delivered · Ready to complete"}
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

                  <div className="pt-3 border-t border-[#CFCFCB] flex flex-wrap items-center justify-between gap-3">
                    {bk.photographerId ? (
                      <Link
                        href={`/photographers/${bk.photographerId}`}
                        className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4"
                      >
                        View {bk.photographerName}&apos;s profile
                      </Link>
                    ) : (
                      <span />
                    )}

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
                            {tr.to === "deposit_paid"
                              ? `Pay deposit (PKR ${bk.depositAmount.toLocaleString()} mock)`
                              : tr.actionLabel}
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

      {/* Past / Completed / Cancelled Bookings */}
      {pastBookings.length > 0 && (
        <section aria-labelledby="past-bookings-heading" className="space-y-4">
          <div className="flex items-baseline justify-between pb-3 border-b border-[#CFCFCB]">
            <h2
              id="past-bookings-heading"
              className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
            >
              Past &amp; closed bookings
            </h2>
            <span className="font-sans text-xs text-slate tabular-nums">
              {pastBookings.length} total
            </span>
          </div>

          <div className="divide-y divide-[#CFCFCB] border border-[#CFCFCB] rounded-[2px] bg-chalk px-5">
            {pastBookings.map((bk) => (
              <div
                key={bk.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-0.5">
                  <div className="font-sans text-sm font-medium text-midnight">
                    {bk.eventType} with {bk.photographerName}
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
