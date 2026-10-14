import React from "react";
import Link from "next/link";
import { SectionHeader, PackageRow } from "@/components/patterns";
import { Chip, Button, Card } from "@/components/ui";
import { MOCK_BOOKINGS, MOCK_GIGS } from "@/lib/mock";

export default function ClientOverviewPage() {
  const activeBooking = MOCK_BOOKINGS[0]; // Sara and Ahmed Mehndi
  const activeGig = MOCK_GIGS[0];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <SectionHeader
        title="Overview"
        lede="Active event bookings, gig proposals, and photographer communications."
        action={
          <Link href="/gigs" tabIndex={-1}>
            <Button variant="primary" size="md">
              Post a gig
            </Button>
          </Link>
        }
      />

      {/* Active Booking Summary Card */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-sans text-base font-semibold text-midnight">
            Upcoming event
          </h3>
          <Chip variant="verified">Deposit paid</Chip>
        </div>

        <Card className="p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-display text-[24px] leading-tight text-midnight">
                {activeBooking.event}, {activeBooking.clientName}
              </span>
              <p className="font-sans text-sm text-slate">
                {activeBooking.date} &bull; {activeBooking.time} &bull; {activeBooking.venue}
              </p>
            </div>
            <div className="shrink-0 flex items-center gap-3">
              <Link href="/client/messages" tabIndex={-1}>
                <Button variant="secondary" size="md">
                  Message Sara
                </Button>
              </Link>
              <Link href="/client/bookings" tabIndex={-1}>
                <Button variant="primary" size="md">
                  View details
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-2 border-t border-[#CFCFCB]">
            <PackageRow
              name={activeBooking.package.name}
              detail={`${activeBooking.package.hours} hours · ${activeBooking.package.photographers} photographers · ${activeBooking.package.editedPhotos} edited photos`}
              price={activeBooking.package.price}
            />
          </div>
        </Card>
      </div>

      {/* Active Gig Proposals */}
      <div className="space-y-3 pt-4">
        <h3 className="font-sans text-base font-semibold text-midnight">
          Active gig inquiries
        </h3>
        <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-sans text-base font-medium text-midnight">
              {activeGig.title}
            </span>
            <p className="font-sans text-xs text-slate">
              {activeGig.city} &bull; {activeGig.date} &bull; {activeGig.bids?.length || 0} photographers bid
            </p>
          </div>
          <Link href="/client/gigs" tabIndex={-1}>
            <Button variant="secondary" size="md">
              Review bids
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
