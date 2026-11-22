import React from "react";
import { redirect } from "next/navigation";
import { Card, Skeleton } from "@/components/ui";
import { loadMyPackages } from "./data";
import { PackagesClient } from "./PackagesClient";

/**
 * Server loader for /photographer/packages. Rendered inside <Suspense>
 * because it reads session cookies.
 */
export async function PackagesScreen() {
  const result = await loadMyPackages();

  if (result.status === "signed-out") redirect("/sign-in");
  if (result.status === "forbidden") redirect("/client");

  if (result.status === "error") {
    return (
      <Card className="p-6 max-w-3xl" role="alert">
        <p className="font-sans text-sm font-semibold text-midnight">
          We could not load your packages
        </p>
        <p className="font-sans text-sm text-slate mt-1">
          Check your connection, then refresh this page.
        </p>
      </Card>
    );
  }

  return <PackagesClient initial={result.data} />;
}

/** Loading state: skeleton blocks in mist. */
export function PackagesSkeleton() {
  return (
    <div className="space-y-6 max-w-3xl" aria-busy="true" aria-label="Loading packages">
      {Array.from({ length: 2 }).map((_, index) => (
        <Card key={index} className="p-6 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <Skeleton className="h-5 w-44" />
            <Skeleton className="h-5 w-28" />
          </div>
          <Skeleton className="h-4 w-72" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
          </div>
        </Card>
      ))}
    </div>
  );
}

