import React, { Suspense } from "react";
import { searchPhotographers } from "@/lib/search/photographers";
import { PhotographersSearchClient } from "./PhotographersSearchClient";
import { Skeleton } from "@/components/ui";

function PhotographersSearchSkeleton() {
  return (
    <div className="w-full py-8 md:py-12 bg-chalk text-midnight min-h-screen">
      <div className="max-w-[1120px] mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          <aside className="w-[260px] shrink-0 border-r border-[#CFCFCB] pr-8 hidden lg:block space-y-5">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </aside>
          <main className="flex-1 min-w-0 w-full space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#CFCFCB]">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-9 w-44" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
              <Skeleton className="h-44 w-full" />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

async function PhotographersSearchContent({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const result = await searchPhotographers(resolvedParams);
  const filterKey = JSON.stringify(result.filters);
  return <PhotographersSearchClient key={filterKey} result={result} />;
}

export default function PhotographersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <Suspense fallback={<PhotographersSearchSkeleton />}>
      <PhotographersSearchContent searchParams={searchParams} />
    </Suspense>
  );
}
