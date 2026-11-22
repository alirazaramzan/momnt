import React, { Suspense } from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/patterns";
import { Button } from "@/components/ui";
import {
  ClientBookingsScreen,
  ClientBookingsSkeleton,
} from "./ClientBookingsScreen";

export default function ClientBookingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Bookings"
        lede="Manage your event requests, respond to photographer proposals, pay mock deposits, and complete delivered shoots."
        action={
          <Link href="/photographers" tabIndex={-1}>
            <Button variant="primary" size="md">
              Browse photographers
            </Button>
          </Link>
        }
      />
      <Suspense fallback={<ClientBookingsSkeleton />}>
        <ClientBookingsScreen />
      </Suspense>
    </div>
  );
}

