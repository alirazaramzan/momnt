import React from "react";
import { redirect } from "next/navigation";
import { Card, Skeleton } from "@/components/ui";
import { loadPortfolio } from "./data";
import { PortfolioClient } from "./PortfolioClient";

/**
 * Server loader for /photographer/portfolio. Rendered inside <Suspense>
 * because it reads session cookies.
 */
export async function PortfolioScreen() {
  const result = await loadPortfolio();

  if (result.status === "signed-out") redirect("/sign-in");
  if (result.status === "forbidden") redirect("/client");

  if (result.status === "error") {
    return (
      <Card className="p-6 max-w-3xl" role="alert">
        <p className="font-sans text-sm font-semibold text-midnight">
          We could not load your portfolio
        </p>
        <p className="font-sans text-sm text-slate mt-1">
          Check your connection, then refresh this page.
        </p>
      </Card>
    );
  }

  return <PortfolioClient initial={result.data} />;
}

/** Loading state: skeleton blocks in mist. */
export function PortfolioSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading portfolio">
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-28 rounded-full" />
        </div>
        <Skeleton className="h-24 w-full" />
      </Card>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="p-4 space-y-3">
            <Skeleton className="w-full aspect-[4/3]" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-8 w-32" />
          </Card>
        ))}
      </div>
    </div>
  );
}

