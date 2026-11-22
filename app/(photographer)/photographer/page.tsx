import React, { Suspense } from "react";
import { Card, Skeleton } from "@/components/ui";
import { loadPhotographerBookingsAndPackages } from "@/lib/booking/queries";
import { createClient } from "@/lib/supabase/server";
import {
  PhotographerDashboardClient,
  type GigItem,
} from "./PhotographerDashboardClient";

async function loadMatchingGigs(city: string | null): Promise<GigItem[]> {
  try {
    const supabase = await createClient();
    const { data: gigs } = await supabase
      .from("gigs")
      .select("id, title, city, event_type")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(3);

    if (!gigs || gigs.length === 0) return [];

    return gigs.map((g) => ({
      id: g.id,
      title: `${g.title}, ${g.city}`,
      reason:
        city && g.city.toLowerCase() === city.toLowerCase()
          ? `Matches your city (${g.city}) and ${g.event_type.toLowerCase()} coverage`
          : `Open ${g.event_type.toLowerCase()} inquiry`,
    }));
  } catch {
    return [];
  }
}

async function PhotographerOverviewContent() {
  const result = await loadPhotographerBookingsAndPackages();

  if (result.status !== "ok") {
    return <PhotographerDashboardClient />;
  }

  const matchingGigs = await loadMatchingGigs(result.city);

  return (
    <PhotographerDashboardClient
      initialBookings={result.bookings}
      packages={result.packages}
      verificationStatus={result.verificationStatus}
      matchingGigs={matchingGigs}
    />
  );
}

export default function PhotographerOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-8" aria-busy="true">
          <Skeleton className="h-14 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <Card className="p-6 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </Card>
            <Card className="p-6 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </Card>
            <Card className="p-6 space-y-3">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </Card>
          </div>
        </div>
      }
    >
      <PhotographerOverviewContent />
    </Suspense>
  );
}
