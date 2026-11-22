import React from "react";
import { redirect } from "next/navigation";
import { Card, Skeleton } from "@/components/ui";
import { loadPhotographerBookingsAndPackages } from "@/lib/booking/queries";
import { ProjectsClient } from "./ProjectsClient";

export async function ProjectsScreen() {
  const result = await loadPhotographerBookingsAndPackages();

  if (result.status === "signed-out") redirect("/sign-in");
  if (result.status === "forbidden") redirect("/client");

  if (result.status === "error") {
    return (
      <Card className="p-6 max-w-4xl" role="alert">
        <p className="font-sans text-sm font-semibold text-midnight">
          We could not load your active projects
        </p>
        <p className="font-sans text-sm text-slate mt-1">
          Check your connection, then refresh this page.
        </p>
      </Card>
    );
  }

  return <ProjectsClient initialBookings={result.bookings} />;
}

export function ProjectsSkeleton() {
  return (
    <div
      className="space-y-4 max-w-4xl"
      aria-busy="true"
      aria-label="Loading active projects"
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

