import React, { Suspense } from "react";
import Link from "next/link";
import { EmptyState, PackageRow, SectionHeader } from "@/components/patterns";
import { Button, Card, Chip, Skeleton } from "@/components/ui";
import { loadClientBookings } from "@/lib/booking/queries";
import {
  bookingStatusChipVariant,
  formatBookingStatusLabel,
} from "@/lib/booking/transitions";
import { MOCK_BOOKINGS, MOCK_GIGS } from "@/lib/mock";
import { createClient } from "@/lib/supabase/server";
import { formatIsoDateHuman } from "@/lib/validators/booking";
import { formatPackageDetail } from "@/lib/validators/packages";

async function loadLatestClientGig() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: gig } = await supabase
      .from("gigs")
      .select("id, title, city, event_date, status")
      .eq("client_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!gig) return null;

    const { count } = await supabase
      .from("bids")
      .select("id", { count: "exact", head: true })
      .eq("gig_id", gig.id);

    return {
      title: gig.title,
      city: gig.city,
      date: formatIsoDateHuman(gig.event_date, "long"),
      bidCount: count ?? 0,
    };
  } catch {
    return null;
  }
}

async function ClientOverviewContent() {
  const [bookingsRes, latestGig] = await Promise.all([
    loadClientBookings(),
    loadLatestClientGig(),
  ]);

  const fallbackBooking = MOCK_BOOKINGS[0];
  const fallbackGig = MOCK_GIGS[0];

  if (bookingsRes.status === "ok") {
    const activeList = bookingsRes.bookings.filter(
      (b) => !["completed", "cancelled", "rejected"].includes(b.status)
    );
    const primaryBooking = activeList[0] ?? bookingsRes.bookings[0] ?? null;

    return (
      <>
        {/* Active Booking Summary Card */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-sans text-base font-semibold text-midnight">
              Upcoming event
            </h3>
            {primaryBooking && (
              <Chip variant={bookingStatusChipVariant(primaryBooking.status)}>
                {formatBookingStatusLabel(primaryBooking.status)}
              </Chip>
            )}
          </div>

          {!primaryBooking ? (
            <EmptyState
              message="No upcoming bookings yet. Browse verified photographers to request your event date."
            />
          ) : (
            <Card className="p-6 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-display text-[24px] leading-tight text-midnight">
                    {primaryBooking.eventType} with{" "}
                    {primaryBooking.photographerName}
                  </span>
                  <p className="font-sans text-sm text-slate tabular-nums">
                    {primaryBooking.eventDateLabel} &bull;{" "}
                    {primaryBooking.startTimeLabel} &bull;{" "}
                    {primaryBooking.location}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  {primaryBooking.photographerId && (
                    <Link
                      href={`/photographers/${primaryBooking.photographerId}`}
                      tabIndex={-1}
                    >
                      <Button variant="secondary" size="md">
                        View {primaryBooking.photographerName.split(" ")[0]}
                      </Button>
                    </Link>
                  )}
                  <Link href="/client/bookings" tabIndex={-1}>
                    <Button variant="primary" size="md">
                      View details
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="pt-2 border-t border-[#CFCFCB]">
                <PackageRow
                  name={primaryBooking.package.name}
                  detail={formatPackageDetail({
                    hours: primaryBooking.package.hours,
                    photographers: primaryBooking.package.photographers,
                    editedPhotos: primaryBooking.package.editedPhotos,
                    deliveryTime: primaryBooking.package.deliveryTime,
                    addons: primaryBooking.package.addons,
                  })}
                  price={primaryBooking.price}
                />
              </div>
            </Card>
          )}
        </div>

        {/* Active Gig Proposals */}
        <div className="space-y-3 pt-4">
          <h3 className="font-sans text-base font-semibold text-midnight">
            Active gig inquiries
          </h3>
          <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="font-sans text-base font-medium text-midnight">
                {latestGig ? latestGig.title : fallbackGig.title}
              </span>
              <p className="font-sans text-xs text-slate tabular-nums">
                {latestGig ? latestGig.city : fallbackGig.city} &bull;{" "}
                {latestGig ? latestGig.date : fallbackGig.date} &bull;{" "}
                {latestGig ? latestGig.bidCount : fallbackGig.bids?.length || 0}{" "}
                photographers bid
              </p>
            </div>
            <Link href="/client/bookings" tabIndex={-1}>
              <Button variant="secondary" size="md">
                Manage bookings
              </Button>
            </Link>
          </Card>
        </div>
      </>
    );
  }

  // Fallback for unauthenticated preview
  return (
    <>
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
                {fallbackBooking.event}, {fallbackBooking.clientName}
              </span>
              <p className="font-sans text-sm text-slate">
                {fallbackBooking.date} &bull; {fallbackBooking.time} &bull;{" "}
                {fallbackBooking.venue}
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
              name={fallbackBooking.package.name}
              detail={`${fallbackBooking.package.hours} hours · ${fallbackBooking.package.photographers} photographers · ${fallbackBooking.package.editedPhotos} edited photos`}
              price={fallbackBooking.package.price}
            />
          </div>
        </Card>
      </div>

      <div className="space-y-3 pt-4">
        <h3 className="font-sans text-base font-semibold text-midnight">
          Active gig inquiries
        </h3>
        <Card className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-sans text-base font-medium text-midnight">
              {fallbackGig.title}
            </span>
            <p className="font-sans text-xs text-slate">
              {fallbackGig.city} &bull; {fallbackGig.date} &bull;{" "}
              {fallbackGig.bids?.length || 0} photographers bid
            </p>
          </div>
          <Link href="/client/gigs" tabIndex={-1}>
            <Button variant="secondary" size="md">
              Review bids
            </Button>
          </Link>
        </Card>
      </div>
    </>
  );
}

export default function ClientOverviewPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Overview"
        lede="Active event bookings, gig proposals, and photographer communications."
        action={
          <Link href="/gigs/new" tabIndex={-1}>
            <Button variant="primary" size="md">
              Post a gig
            </Button>
          </Link>
        }
      />

      <Suspense
        fallback={
          <div className="space-y-4">
            <Card className="p-6 space-y-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-72" />
              <Skeleton className="h-12 w-full" />
            </Card>
          </div>
        }
      >
        <ClientOverviewContent />
      </Suspense>
    </div>
  );
}
