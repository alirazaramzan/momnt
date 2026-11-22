"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState, PackageRow } from "@/components/patterns";
import {
  Button,
  Card,
  Chip,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Select,
  Textarea,
  Toast,
} from "@/components/ui";
import {
  proposeBookingAlternative,
  transitionBookingStatus,
} from "@/lib/booking/actions";
import { BOOKING_RULES_CONFIG } from "@/lib/booking/config";
import type {
  EnrichedBookingItem,
  PhotographerOptionPackage,
} from "@/lib/booking/queries";
import {
  bookingStatusChipVariant,
  formatBookingStatusLabel,
} from "@/lib/booking/transitions";
import { formatIsoDateHuman } from "@/lib/validators/booking";
import { formatPackageDetail } from "@/lib/validators/packages";

type ToastState = {
  variant: "verified" | "alert";
  title: string;
  description?: string;
} | null;

export interface RequestsClientProps {
  initialBookings: EnrichedBookingItem[];
  packages: PhotographerOptionPackage[];
}

export function RequestsClient({
  initialBookings,
  packages,
}: RequestsClientProps) {
  const router = useRouter();
  const [bookings, setBookings] =
    useState<EnrichedBookingItem[]>(initialBookings);
  const [proposingBooking, setProposingBooking] =
    useState<EnrichedBookingItem | null>(null);
  const [proposedDate, setProposedDate] = useState<string>("");
  const [proposedPackageId, setProposedPackageId] = useState<string>("");
  const [proposalNote, setProposalNote] = useState<string>("");
  const [proposalError, setProposalError] = useState<string>("");
  const [conflictAlert, setConflictAlert] = useState<string>("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isMutating, startMutating] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4500);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const pendingRequests = bookings.filter((b) => b.status === "requested");
  const pastDecisions = bookings.filter((b) => b.status !== "requested");

  const openProposalDialog = (bk: EnrichedBookingItem) => {
    setProposingBooking(bk);
    setProposedDate(bk.proposedDate ?? bk.eventDate);
    setProposedPackageId(bk.proposedPackageId ?? bk.packageId ?? "");
    setProposalNote(bk.proposalNote ?? "");
    setProposalError("");
  };

  const handleTransition = (
    bk: EnrichedBookingItem,
    nextStatus: "accepted" | "rejected"
  ) => {
    setConflictAlert("");
    startMutating(async () => {
      const result = await transitionBookingStatus({
        booking_id: bk.id,
        next_status: nextStatus,
      });

      if (result.ok) {
        setBookings((prev) =>
          prev.map((item) =>
            item.id === bk.id
              ? {
                  ...item,
                  status: result.status,
                  proposedDate: null,
                  proposedDateLabel: null,
                  proposedPackageId: null,
                  proposedPackage: null,
                }
              : item
          )
        );
        setToast({
          variant: "verified",
          title:
            nextStatus === "accepted" ? "Request accepted" : "Request declined",
          description: result.message,
        });
      } else {
        if (result.conflict) {
          setConflictAlert(result.error);
        }
        setToast({
          variant: "alert",
          title: "Could not update request",
          description: result.error,
        });
      }
    });
  };

  const handleSendProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposingBooking) return;
    setProposalError("");

    startMutating(async () => {
      const result = await proposeBookingAlternative({
        booking_id: proposingBooking.id,
        proposed_date: proposedDate || null,
        proposed_package_id: proposedPackageId || null,
        proposal_note: proposalNote || null,
      });

      if (result.ok) {
        const matchedPkg = packages.find((p) => p.id === proposedPackageId);
        setBookings((prev) =>
          prev.map((item) =>
            item.id === proposingBooking.id
              ? {
                  ...item,
                  proposedDate: proposedDate || null,
                  proposedDateLabel: proposedDate
                    ? formatIsoDateHuman(proposedDate, "long")
                    : null,
                  proposedPackageId: proposedPackageId || null,
                  proposedPackage: matchedPkg
                    ? {
                        id: matchedPkg.id,
                        name: matchedPkg.name,
                        price: matchedPkg.price,
                        hours: matchedPkg.hours,
                        photographers: matchedPkg.photographers,
                        editedPhotos: matchedPkg.editedPhotos,
                        deliveryDays: matchedPkg.deliveryDays,
                        deliveryTime: matchedPkg.deliveryTime,
                        addons: [],
                      }
                    : null,
                  proposalNote: proposalNote || null,
                }
              : item
          )
        );
        setProposingBooking(null);
        setToast({
          variant: "verified",
          title: "Proposal sent",
          description: result.message,
        });
      } else {
        setProposalError(result.error);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {conflictAlert && (
        <div
          role="alert"
          className="border border-alert rounded-[2px] p-4 bg-chalk flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <p className="font-sans text-xs font-semibold text-alert">
              Double-booking conflict
            </p>
            <p className="font-sans text-sm text-midnight">{conflictAlert}</p>
          </div>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={() => setConflictAlert("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      {/* Pending Requests Section */}
      <section aria-labelledby="pending-requests-heading" className="space-y-4">
        <div className="flex items-baseline justify-between pb-3 border-b border-[#CFCFCB]">
          <h2
            id="pending-requests-heading"
            className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
          >
            Pending requests
          </h2>
          <span className="font-sans text-xs text-slate tabular-nums">
            {pendingRequests.length} awaiting reply
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <EmptyState
            message="No pending booking requests right now. Keep your calendar up to date so clients can request open dates."
            actionLabel="Open calendar"
            onAction={() => router.push("/photographer/calendar")}
          />
        ) : (
          <div className="space-y-4" role="list">
            {pendingRequests.map((bk) => {
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
                        Deposit: PKR {bk.depositAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {bk.requirements && (
                    <div className="border-l-2 border-brass pl-3.5 py-0.5">
                      <p className="font-sans text-xs text-slate">
                        Client notes
                      </p>
                      <p className="font-sans text-sm text-midnight leading-relaxed">
                        {bk.requirements}
                      </p>
                    </div>
                  )}

                  <div className="pt-2 border-t border-[#CFCFCB]">
                    <PackageRow
                      name={bk.package.name}
                      detail={detailLine}
                      price={bk.package.price}
                      className="p-0 border-b-0 hover:bg-transparent"
                    />
                  </div>

                  {/* Active Counter-Proposal Notice */}
                  {hasProposal && (
                    <div className="border border-brass rounded-[2px] p-4 space-y-1.5 bg-chalk">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-sans text-xs font-semibold text-midnight">
                          Counter-proposal sent to {bk.clientName}
                        </span>
                        <Chip variant="brass-outline" size="sm">
                          Awaiting client confirmation
                        </Chip>
                      </div>
                      <p className="font-sans text-xs text-slate tabular-nums">
                        {bk.proposedDateLabel
                          ? `Proposed date: ${bk.proposedDateLabel}`
                          : "Same date"}
                        {bk.proposedPackage
                          ? ` · Proposed package: ${bk.proposedPackage.name} (PKR ${bk.proposedPackage.price.toLocaleString()})`
                          : ""}
                      </p>
                      {bk.proposalNote && (
                        <p className="font-sans text-xs text-midnight pt-1">
                          &ldquo;{bk.proposalNote}&rdquo;
                        </p>
                      )}
                    </div>
                  )}

                  <div className="pt-3 border-t border-[#CFCFCB] flex flex-wrap items-center justify-between gap-3">
                    <p className="font-sans text-xs text-slate">
                      {BOOKING_RULES_CONFIG.shortSummary}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => openProposalDialog(bk)}
                      >
                        {hasProposal
                          ? "Update proposal"
                          : "Propose date or package"}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isMutating}
                        onClick={() => handleTransition(bk, "rejected")}
                      >
                        Decline
                      </Button>
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        loading={isMutating}
                        onClick={() => handleTransition(bk, "accepted")}
                      >
                        Accept request
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Answered Requests Link to Projects */}
      {pastDecisions.length > 0 && (
        <section
          aria-labelledby="answered-requests-heading"
          className="space-y-4 pt-4"
        >
          <div className="flex items-baseline justify-between pb-3 border-b border-[#CFCFCB]">
            <h2
              id="answered-requests-heading"
              className="font-sans text-base font-semibold text-midnight"
            >
              Answered requests &amp; active shoots
            </h2>
            <Link
              href="/photographer/projects"
              className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4"
            >
              Manage in projects ({pastDecisions.length}) &rarr;
            </Link>
          </div>
        </section>
      )}

      {/* Propose Alternative Date or Package Dialog */}
      <Dialog
        open={Boolean(proposingBooking)}
        onOpenChange={(open) => !open && setProposingBooking(null)}
      >
        <DialogContent onClose={() => setProposingBooking(null)}>
          <form onSubmit={handleSendProposal} className="space-y-4" noValidate>
            <DialogHeader>
              <DialogTitle>
                Propose new terms for {proposingBooking?.clientName}
              </DialogTitle>
              <DialogDescription>
                Suggest an available date or a different coverage package. The
                client can accept your proposal with one click.
              </DialogDescription>
            </DialogHeader>

            {proposalError && (
              <p
                role="alert"
                className="font-sans text-xs font-medium text-alert"
              >
                {proposalError}
              </p>
            )}

            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="propose-date">Proposed date</Label>
                <Input
                  id="propose-date"
                  type="date"
                  value={proposedDate}
                  onChange={(e) => setProposedDate(e.target.value)}
                  className="tabular-nums"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="propose-package">Proposed package</Label>
                <Select
                  id="propose-package"
                  value={proposedPackageId}
                  onChange={(e) => setProposedPackageId(e.target.value)}
                >
                  <option value="">Keep client&apos;s selected package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — PKR {pkg.price.toLocaleString()} ({pkg.hours}{" "}
                      hrs)
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="propose-note" optional>
                  Note to client
                </Label>
                <Textarea
                  id="propose-note"
                  value={proposalNote}
                  onChange={(e) => setProposalNote(e.target.value)}
                  placeholder="Share why this date or package works better for their event..."
                  className="min-h-[80px]"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setProposingBooking(null)}
                disabled={isMutating}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isMutating}
              >
                Send proposal
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
