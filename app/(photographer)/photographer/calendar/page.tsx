import React, { Suspense } from "react";
import { SectionHeader } from "@/components/patterns";
import { CalendarScreen, CalendarSkeleton } from "./CalendarScreen";

export default function PhotographerCalendarPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Availability calendar"
        lede="Mark dates as available, booked, or unavailable. Confirmed bookings automatically lock their date."
      />
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarScreen />
      </Suspense>
    </div>
  );
}

