import React, { Suspense } from "react";
import { SectionHeader } from "@/components/patterns";
import { RequestsScreen, RequestsSkeleton } from "./RequestsScreen";

export default function PhotographerRequestsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Booking requests"
        lede="Review incoming client inquiries. Accept to lock the date, decline, or propose another date or package."
      />
      <Suspense fallback={<RequestsSkeleton />}>
        <RequestsScreen />
      </Suspense>
    </div>
  );
}

