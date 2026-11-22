import React from "react";
import { redirect } from "next/navigation";
import { Card, Skeleton } from "@/components/ui";
import { loadClientBookings } from "@/lib/booking/queries";
import { ClientBookingsClient } from "./ClientBookingsClient";

export async function ClientBookingsScreen() {
  const result = await loadClientBookings();

  if (result.status === "signed-out") redirect("/sign-in");
  if (result.status === "forbidden") redirect("/photographer");

  if (result.status === "error") {
    return (
      <Card className="p-6 max-w-4xl" role="alert">
        <p className="font-sans text-sm font-semibold text-midnight">
          We could not load your bookings
        </p>
        <p className="font-sans text-sm text-slate mt-1">
          Check your connection, then refresh this page.
        </p>
      </Card>
    );
  }

  return <ClientBookingsClient initialBookings={result.bookings} />;
}

export function ClientBookingsSkeleton() {
  return (
    <div
      className="space-y-4 max-w-4xl"
      aria-busy="true"
      aria-label="Loading client bookings"
    >
      {Array.from({ length: 2 }).map((_, i) => (
        <Card key={i} className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-4 w-72" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ))}
    </div>
  );
}

