"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Chip } from "@/components/ui";
import { EmptyState } from "@/components/patterns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

// Fixture data matching concepts-1 and AGENTS.md
interface RequestItem {
  id: string;
  event: string;
  place: string;
  date: string;
  hours: number;
}

interface UpcomingShootItem {
  id: string;
  event: string;
  date: string;
  status: "deposit_paid" | "accepted";
}

interface GigItem {
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

export function PhotographerDashboardClient() {
  const [showEmpty, setShowEmpty] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

  const requests = showEmpty ? [] : INITIAL_REQUESTS;
  const shoots = showEmpty ? [] : INITIAL_SHOOTS;
  const gigs = showEmpty ? [] : INITIAL_GIGS;

  return (
    <div className="space-y-8">
      {/* Verification notice banner with 1px brass border, no fill */}
      <div
        className="border border-brass rounded-[2px] p-4 bg-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        role="status"
        aria-label="Verification status notice"
      >
        <p className="font-sans text-sm text-midnight leading-relaxed">
          Verification under review. You can build your profile while we check
          your documents.
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
          <h1 className="font-sans text-xs text-slate">
            Schedule overview
          </h1>
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
              onAction={() => setShowEmpty(false)}
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
                    <div className="space-y-0.5">
                      <div className="font-sans text-sm font-medium text-midnight">
                        {req.event}, {req.place}
                      </div>
                      <div className="font-sans text-xs text-slate">
                        {req.date}, {req.hours} hours
                      </div>
                    </div>

                    <Button
                      variant={isFirst ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => setSelectedRequest(req)}
                      className="shrink-0"
                    >
                      Reply
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
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
              actionLabel="Browse gigs"
              onAction={() => setShowEmpty(false)}
            />
          ) : (
            <div className="divide-y divide-[#CFCFCB]" role="list">
              {shoots.map((shoot) => (
                <div
                  key={shoot.id}
                  tabIndex={0}
                  role="listitem"
                  aria-label={`Shoot: ${shoot.event}, ${shoot.date}, status ${shoot.status === "deposit_paid" ? "deposit paid" : "accepted"}`}
                  className="group py-3.5 px-2 -mx-2 flex items-center justify-between gap-4 rounded-[2px] transition-colors hover:bg-mist/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight"
                >
                  <div className="space-y-0.5">
                    <div className="font-sans text-sm font-medium text-midnight">
                      {shoot.event}
                    </div>
                    <div className="font-sans text-xs text-slate">
                      {shoot.date}
                    </div>
                  </div>

                  {shoot.status === "deposit_paid" ? (
                    <Chip variant="verified" size="sm">
                      Deposit paid
                    </Chip>
                  ) : (
                    <Chip variant="neutral" size="sm">
                      Accepted
                    </Chip>
                  )}
                </div>
              ))}
            </div>
          )}
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

                  <Link href="/gigs" tabIndex={-1}>
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
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3 text-sm font-sans text-midnight">
            <p className="text-xs text-slate leading-relaxed">
              Confirm your availability or propose an alternate slot. Clients
              expect a response within the hour.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="secondary"
              size="md"
              onClick={() => setSelectedRequest(null)}
            >
              Decline date
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => setSelectedRequest(null)}
            >
              Accept request
            </Button>
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
            <DialogTitle>Verification under review</DialogTitle>
            <DialogDescription>
              Momnt curation and identification check
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4 text-sm font-sans text-midnight">
            <p className="text-xs text-slate leading-relaxed">
              Your CNIC and portfolio submissions are currently being audited by
              our verification team. Most reviews complete within 48 hours.
            </p>
            <div className="border border-[#CFCFCB] p-3 rounded-[2px] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">Portfolio review</span>
                <span className="text-verified font-medium">In review</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate">Identity check</span>
                <span className="text-verified font-medium">In review</span>
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
    </div>
  );
}
