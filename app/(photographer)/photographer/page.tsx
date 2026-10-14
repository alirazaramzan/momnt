import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/patterns";
import { Button, Card } from "@/components/ui";
import { VerifiedBadge } from "@/components/brand";
import { MOCK_PHOTOGRAPHERS, MOCK_BOOKINGS } from "@/lib/mock";

export default function PhotographerOverviewPage() {
  const photographer = MOCK_PHOTOGRAPHERS[0]; // Sara Khan
  const pendingRequests = MOCK_BOOKINGS.filter((b) => b.status === "requested" || b.status === "deposit");

  return (
    <div className="space-y-8">
      {/* Header with verified profile seal */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#CFCFCB] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[32px] leading-tight text-midnight">
              {photographer.name}
            </h1>
            {photographer.verified && <VerifiedBadge />}
          </div>
          <p className="font-sans text-sm text-slate">
            {photographer.city} &bull; Replies {photographer.replyTime} &bull; Next free: {photographer.nextFree}
          </p>
        </div>
        <Link href="/photographer/calendar" tabIndex={-1}>
          <Button variant="secondary" size="md">
            Manage calendar
          </Button>
        </Link>
      </div>

      {/* Verification status notice with brass hairline */}
      <div className="border border-[#C2A267] rounded-[2px] p-4 bg-chalk text-midnight">
        <p className="font-sans text-sm font-medium">
          Verified member. Profile listed on public discovery and eligible for gig marketplace bids.
        </p>
      </div>

      {/* Requests to answer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-semibold text-midnight">
            Upcoming bookings &amp; requests
          </h2>
          <span className="font-sans text-xs text-slate">
            {pendingRequests.length} active events
          </span>
        </div>

        <div className="divide-y divide-[#CFCFCB] border border-[#CFCFCB] rounded-[2px] bg-chalk">
          {pendingRequests.map((req) => (
            <div
              key={req.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#E3E5E8]/20 transition-colors"
            >
              <div className="space-y-0.5">
                <div className="font-sans text-sm font-medium text-midnight">
                  {req.event}, {req.clientName}
                </div>
                <div className="font-sans text-xs text-slate">
                  {req.date} &bull; {req.time} &bull; {req.venue}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-sans text-sm font-semibold tabular-nums text-midnight">
                  PKR {req.package.price.toLocaleString()}
                </span>
                <Link href={`/photographer/requests`} tabIndex={-1}>
                  <Button variant={req.status === "requested" ? "primary" : "secondary"} size="sm">
                    {req.status === "requested" ? "Reply" : "View"}
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
