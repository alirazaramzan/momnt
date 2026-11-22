import React from "react";
import { redirect } from "next/navigation";
import { Card, Skeleton } from "@/components/ui";
import { loadPhotographerCalendarData } from "@/lib/booking/queries";
import { CalendarClient } from "./CalendarClient";

export async function CalendarScreen() {
  const result = await loadPhotographerCalendarData();

  if (result.status === "signed-out") redirect("/sign-in");
  if (result.status === "forbidden") redirect("/client");

  if (result.status === "error") {
    return (
      <Card className="p-6 max-w-4xl" role="alert">
        <p className="font-sans text-sm font-semibold text-midnight">
          We could not load your availability calendar
        </p>
        <p className="font-sans text-sm text-slate mt-1">
          Check your connection, then refresh this page.
        </p>
      </Card>
    );
  }

  return (
    <CalendarClient
      initialEntries={result.entries}
      upcomingBookings={result.upcomingBookings}
    />
  );
}

export function CalendarSkeleton() {
  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-8"
      aria-busy="true"
      aria-label="Loading availability calendar"
    >
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="grid grid-cols-7 gap-2 pt-2">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
    </div>
  );
}

