"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/patterns";
import {
  Button,
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
import type {
  EnrichedBookingItem,
  PhotographerOptionPackage,
} from "@/lib/booking/queries";
import {
  bookingStatusChipVariant,
  formatBookingStatusLabel,
  type DbBookingStatus,
} from "@/lib/booking/transitions";

// Fixture data matching concepts-1 and AGENTS.md when no database rows are passed
export interface RequestItem {
  id: string;
  event: string;
  place: string;
  date: string;
  isoDate?: string;
  hours: number;
  clientName?: string;
  packageId?: string | null;
  price?: number;
  proposedDate?: string | null;
  proposedPackageId?: string | null;
  proposalNote?: string | null;
  isLiveBooking?: boolean;
}

export interface UpcomingShootItem {
  id: string;
  event: string;
  date: string;
  status: DbBookingStatus;
}

export interface GigItem {
  id: string;
  title: string;
  reason: string;
}

const INITIAL_REQUESTS: RequestItem[] = [
  {
    id: "req-1",
    event: "Mehndi",
    place: "Karachi",
    date: "14 Dec",
    hours: 6,
  },
  {
    id: "req-2",
    event: "Nikkah",
    place: "Lahore",
    date: "20 Dec",
    hours: 4,
  },
  {
    id: "req-3",
    event: "Baraat",
    place: "Karachi",
    date: "22 Dec",
    hours: 5,
  },
];

const INITIAL_SHOOTS: UpcomingShootItem[] = [
  {
    id: "shoot-1",
    event: "Brand shoot",
    date: "Sat 18 Oct",
    status: "deposit_paid",
  },
  {
    id: "shoot-2",
    event: "Baraat",
    date: "Sun 9 Nov",
    status: "accepted",
  },
  {
    id: "shoot-3",
    event: "Walima",
    date: "Fri 28 Nov",
    status: "deposit_paid",
  },
];

const INITIAL_GIGS: GigItem[] = [
  {
    id: "gig-1",
    title: "Product shoot, Karachi",
    reason: "Matches your city and style",
  },
  {
    id: "gig-2",
    title: "Corporate event, Lahore",
    reason: "Budget in your range",
  },
  {
    id: "gig-3",
    title: "Editorial fashion shoot, Karachi",
    reason: "Matches your documentary style",
  },
];

type ToastState = {
  variant: "verified" | "alert";
  title: string;
  description?: string;
} | null;

export interface PhotographerDashboardClientProps {
  initialBookings?: EnrichedBookingItem[];
  packages?: PhotographerOptionPackage[];
  verificationStatus?: "pending" | "under_review" | "verified" | "rejected";
  matchingGigs?: GigItem[];
}

export function PhotographerDashboardClient({
  initialBookings,
  packages = [],
  verificationStatus = "under_review",
  matchingGigs,
}: PhotographerDashboardClientProps) {
  const router = useRouter();
  const hasLiveBookings = initialBookings !== undefined;
  const [liveBookings, setLiveBookings] = useState<EnrichedBookingItem[]>(
    initialBookings ?? []
  );
  const [showEmpty, setShowEmpty] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(
    null
  );
  const [showProposeFields, setShowProposeFields] = useState(false);
  const [proposedDate, setProposedDate] = useState("");
  const [proposedPackageId, setProposedPackageId] = useState("");
  const [proposalNote, setProposalNote] = useState("");
  const [dialogError, setDialogError] = useState("");
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  const [isMutating, startMutating] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const mappedLiveRequests: RequestItem[] = liveBookings
    .filter((b) => b.status === "requested")
    .map((b) => ({
      id: b.id,
      event: b.eventType,
      place: b.location,
      date: b.eventDateShort,
      isoDate: b.eventDate,
      hours: b.durationHours,
      clientName: b.clientName,
      packageId: b.packageId,
      price: b.price,
      proposedDate: b.proposedDate,
      proposedPackageId: b.proposedPackageId,
      proposalNote: b.proposalNote,
      isLiveBooking: true,
    }));

  const mappedLiveShoots: UpcomingShootItem[] = liveBookings
    .filter((b) =>
      ["accepted", "deposit_paid", "shoot_done", "delivered"].includes(b.status)
    )
    .map((b) => ({
      id: b.id,
      event: `${b.eventType} · ${b.clientName}`,
      date: b.eventDateShort,
      status: b.status,
    }));

  const requests = showEmpty
    ? []
    : hasLiveBookings
    ? mappedLiveRequests
    : INITIAL_REQUESTS;

  const shoots = showEmpty
    ? []
    : hasLiveBookings
    ? mappedLiveShoots
    : INITIAL_SHOOTS;

  const gigs = showEmpty
    ? []
    : matchingGigs && matchingGigs.length > 0
    ? matchingGigs
    : INITIAL_GIGS;

  const openRequestModal = (req: RequestItem) => {
    setSelectedRequest(req);
    setShowProposeFields(false);
    setProposedDate(req.proposedDate ?? req.isoDate ?? "");
    setProposedPackageId(req.proposedPackageId ?? req.packageId ?? "");
    setProposalNote(req.proposalNote ?? "");
    setDialogError("");
  };

  const handleAcceptOrReject = (nextStatus: "accepted" | "rejected") => {
    if (!selectedRequest) return;

    if (!selectedRequest.isLiveBooking) {
      setSelectedRequest(null);
      return;
    }

    setDialogError("");
    startMutating(async () => {
      const result = await transitionBookingStatus({
        booking_id: selectedRequest.id,
        next_status: nextStatus,
      });

      if (result.ok) {
        setLiveBookings((prev) =>
          prev.map((item) =>
            item.id === selectedRequest.id
              ? { ...item, status: result.status }
              : item
          )
        );
        setSelectedRequest(null);
        setToast({
          variant: "verified",
          title:
            nextStatus === "accepted" ? "Request accepted" : "Request declined",
          description: result.message,
        });
      } else {
        setDialogError(result.error);
      }
    });
  };

  const handleSendCounterProposal = () => {
    if (!selectedRequest || !selectedRequest.isLiveBooking) {
      setSelectedRequest(null);
      return;
    }

    setDialogError("");
    startMutating(async () => {
      const result = await proposeBookingAlternative({
        booking_id: selectedRequest.id,
        proposed_date: proposedDate || null,
        proposed_package_id: proposedPackageId || null,
        proposal_note: proposalNote || null,
      });

      if (result.ok) {
        setLiveBookings((prev) =>
          prev.map((item) =>
            item.id === selectedRequest.id
              ? {
                  ...item,
                  proposedDate: proposedDate || null,
                  proposedPackageId: proposedPackageId || null,
                  proposalNote: proposalNote || null,
                }
              : item
          )
        );
        setSelectedRequest(null);
        setToast({
          variant: "verified",
          title: "Proposal sent",
          description: result.message,
        });
      } else {
        setDialogError(result.error);
      }
    });
  };

  return (
    <div className="space-y-8">
      {/* Verification notice banner with 1px brass border, no fill */}
      <div
        className="border border-brass rounded-[2px] p-4 bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        role="status"
        aria-label="Verification status notice"
      >
        <p className="font-sans text-sm text-midnight leading-relaxed">
          {verificationStatus === "verified"
            ? "Verified Momnt photographer. Your calendar and packages are live for client booking requests."
            : verificationStatus === "rejected"
            ? "Verification requires attention. Review admin notes in your verification status."
            : "Verification under review. You can build your profile while we check your documents."}
        </p>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => setShowStatusModal(true)}
          className="font-sans text-xs text-midnight font-medium shrink-0 self-start sm:self-auto"
        >
          View status
        </Button>
      </div>

      {/* Mode toggle for testing / inspection */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-sans text-xs text-slate">Schedule overview</h1>
        </div>
        <Button
          variant="quiet"
          size="sm"
          onClick={() => setShowEmpty(!showEmpty)}
          className="font-sans text-xs text-slate hover:text-midnight"
        >
          {showEmpty ? "Show active schedule" : "Preview empty states"}
        </Button>
      </div>

      {/* Three schedule columns: stack on mobile, 3 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10 items-start">
        {/* Column 1: Requests to answer (pending requests first) */}
        <section aria-labelledby="requests-heading" className="space-y-4">
          <div className="pb-3 border-b border-[#CFCFCB] flex items-baseline justify-between">
            <h2
              id="requests-heading"
              className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
            >
              Requests to answer
            </h2>
            {!showEmpty && (
              <span className="font-sans text-xs text-slate tabular-nums">
                {requests.length} pending
              </span>
            )}
          </div>

          {requests.length === 0 ? (
            <EmptyState
              message="No pending booking requests to answer."
              actionLabel="Update calendar"
              onAction={() =>
                showEmpty
                  ? setShowEmpty(false)
                  : router.push("/photographer/calendar")
              }
            />
          ) : (
            <div className="divide-y divide-[#CFCFCB]" role="list">
              {requests.map((req, index) => {
                const isFirst = index === 0;
                return (
                  <div
                    key={req.id}
                    tabIndex={0}
                    role="listitem"
                    aria-label={`Request: ${req.event}, ${req.place}, ${req.date}, ${req.hours} hours`}
                    className="group py-3.5 px-2 -mx-2 flex items-center justify-between gap-4 rounded-[2px] transition-colors hover:bg-mist/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight"
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-sans text-sm font-medium text-midnight truncate">
                        {req.event}, {req.place}
                      </div>
                      <div className="font-sans text-xs text-slate tabular-nums">
                        {req.date}, {req.hours} hours
                        {req.clientName ? ` · ${req.clientName}` : ""}
                      </div>
                    </div>

                    <Button
                      variant={isFirst ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => openRequestModal(req)}
                      className="shrink-0"
                    >
                      Reply
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          <div className="pt-1">
            <Link
              href="/photographer/requests"
              className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4"
            >
              Open full requests queue &rarr;
            </Link>
          </div>
        </section>

        {/* Column 2: Upcoming shoots */}
        <section aria-labelledby="shoots-heading" className="space-y-4">
          <div className="pb-3 border-b border-[#CFCFCB] flex items-baseline justify-between">
            <h2
              id="shoots-heading"
              className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
            >
              Upcoming shoots
            </h2>
            {!showEmpty && (
              <span className="font-sans text-xs text-slate tabular-nums">
                {shoots.length} booked
              </span>
            )}
          </div>

          {shoots.length === 0 ? (
            <EmptyState
              message="No upcoming shoots on your schedule."
              actionLabel="Manage calendar"
              onAction={() =>
                showEmpty
                  ? setShowEmpty(false)
                  : router.push("/photographer/calendar")
              }
            />
          ) : (
            <div className="divide-y divide-[#CFCFCB]" role="list">
              {shoots.map((shoot) => (
                <div
                  key={shoot.id}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`Shoot: ${shoot.event}, ${shoot.date}, status ${formatBookingStatusLabel(
                    shoot.status
                  ).toLowerCase()}`}
                  className="group py-3.5 px-2 -mx-2 flex items-center justify-between gap-4 rounded-[2px] transition-colors hover:bg-mist/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="font-sans text-sm font-medium text-midnight truncate">
                      {shoot.event}
                    </div>
                    <div className="font-sans text-xs text-slate tabular-nums">
                      {shoot.date}
                    </div>
                  </div>

                  <Chip
                    variant={bookingStatusChipVariant(shoot.status)}
                    size="sm"
                  >
                    {formatBookingStatusLabel(shoot.status)}
                  </Chip>
                </div>
              ))}
            </div>
          )}

          <div className="pt-1">
            <Link
              href="/photographer/projects"
              className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4"
            >
              Manage active projects &rarr;
            </Link>
          </div>
        </section>

        {/* Column 3: Gigs for you */}
        <section aria-labelledby="gigs-heading" className="space-y-4">
          <div className="pb-3 border-b border-[#CFCFCB] flex items-baseline justify-between">
            <h2
              id="gigs-heading"
              className="font-sans text-[22px] leading-[30px] font-semibold text-midnight"
            >
              Gigs for you
            </h2>
            {!showEmpty && (
              <span className="font-sans text-xs text-slate tabular-nums">
                {gigs.length} matching
              </span>
            )}
          </div>

          {gigs.length === 0 ? (
            <EmptyState
              message="No matching gigs found right now."
              actionLabel="Update preferences"
              onAction={() => setShowEmpty(false)}
            />
          ) : (
            <div className="divide-y divide-[#CFCFCB]" role="list">
              {gigs.map((gig) => (
                <div
                  key={gig.id}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`Gig: ${gig.title}, ${gig.reason}`}
                  className="group py-3.5 px-2 -mx-2 flex items-center justify-between gap-4 rounded-[2px] transition-colors hover:bg-mist/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-sans text-sm font-medium text-midnight truncate">
                      {gig.title}
                    </div>
                    <div className="font-sans text-xs text-slate">
                      {gig.reason}
                    </div>
                  </div>

                  <Link href="/gigs/new" tabIndex={-1}>
                    <Button
                      variant="quiet"
                      size="sm"
                      className="font-sans text-xs text-midnight font-medium shrink-0"
                    >
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Reply Dialog */}
      <Dialog
        open={Boolean(selectedRequest)}
        onOpenChange={(open) => !open && setSelectedRequest(null)}
      >
        <DialogContent onClose={() => setSelectedRequest(null)}>
          <DialogHeader>
            <DialogTitle>
              Reply to {selectedRequest?.event} request
            </DialogTitle>
            <DialogDescription>
              {selectedRequest?.place} &bull; {selectedRequest?.date} &bull;{" "}
              {selectedRequest?.hours} hours
              {selectedRequest?.price
                ? ` · PKR ${selectedRequest.price.toLocaleString()}`
                : ""}
            </DialogDescription>
          </DialogHeader>

          {dialogError && (
            <p role="alert" className="font-sans text-xs font-medium text-alert">
              {dialogError}
            </p>
          )}

          <div className="py-3 space-y-4 text-sm font-sans text-midnight">
            <p className="text-xs text-slate leading-relaxed">
              Accepting automatically marks this date as booked on your calendar.
              Or propose an alternate date or package below.
            </p>

            {selectedRequest?.isLiveBooking && (
              <div className="space-y-3 pt-2 border-t border-[#CFCFCB]">
                <button
                  type="button"
                  onClick={() => setShowProposeFields(!showProposeFields)}
                  className="font-sans text-xs font-medium text-midnight underline underline-offset-4"
                >
                  {showProposeFields
                    ? "Hide counter-proposal options"
                    : "Propose another date or package instead"}
                </button>

                {showProposeFields && (
                  <div className="space-y-3 pt-1">
                    <div className="space-y-1">
                      <Label htmlFor="dash-propose-date">Proposed date</Label>
                      <Input
                        id="dash-propose-date"
                        type="date"
                        value={proposedDate}
                        onChange={(e) => setProposedDate(e.target.value)}
                        className="tabular-nums"
                      />
                    </div>
                    {packages.length > 0 && (
                      <div className="space-y-1">
                        <Label htmlFor="dash-propose-pkg">
                          Proposed package
                        </Label>
                        <Select
                          id="dash-propose-pkg"
                          value={proposedPackageId}
                          onChange={(e) => setProposedPackageId(e.target.value)}
                        >
                          <option value="">Keep requested package</option>
                          {packages.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — PKR {p.price.toLocaleString()}
                            </option>
                          ))}
                        </Select>
                      </div>
                    )}
                    <div className="space-y-1">
                      <Label htmlFor="dash-propose-note" optional>
                        Note to client
                      </Label>
                      <Textarea
                        id="dash-propose-note"
                        value={proposalNote}
                        onChange={(e) => setProposalNote(e.target.value)}
                        placeholder="Optional message for the client..."
                        className="min-h-[68px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              size="md"
              disabled={isMutating}
              onClick={() => handleAcceptOrReject("rejected")}
            >
              Decline date
            </Button>
            {showProposeFields && selectedRequest?.isLiveBooking ? (
              <Button
                variant="primary"
                size="md"
                loading={isMutating}
                onClick={handleSendCounterProposal}
              >
                Send proposal
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                loading={isMutating}
                onClick={() => handleAcceptOrReject("accepted")}
              >
                Accept request
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Verification Status Dialog */}
      <Dialog
        open={showStatusModal}
        onOpenChange={(open) => setShowStatusModal(open)}
      >
        <DialogContent onClose={() => setShowStatusModal(false)}>
          <DialogHeader>
            <DialogTitle>
              {verificationStatus === "verified"
                ? "Verified photographer"
                : "Verification under review"}
            </DialogTitle>
            <DialogDescription>
              Momnt curation and identification check
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-sm font-sans text-midnight">
            <p className="text-xs text-slate leading-relaxed">
              {verificationStatus === "verified"
                ? "Your CNIC and portfolio have been verified by Momnt. Clients can book your packages directly."
                : "Your CNIC and portfolio submissions are currently being audited by our verification team. Most reviews complete within 48 hours."}
            </p>
            <div className="border border-[#CFCFCB] p-3 rounded-[2px] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">Portfolio review</span>
                <span className="text-verified font-medium">
                  {verificationStatus === "verified" ? "Verified" : "In review"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">Identity check</span>
                <span className="text-verified font-medium">
                  {verificationStatus === "verified" ? "Verified" : "In review"}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="primary"
              size="md"
              onClick={() => setShowStatusModal(false)}
            >
              Got it
            </Button>
          </DialogFooter>
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
