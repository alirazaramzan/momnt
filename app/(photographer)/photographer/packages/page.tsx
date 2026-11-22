import React, { Suspense } from "react";
import { SectionHeader } from "@/components/patterns";
import { PackagesScreen, PackagesSkeleton } from "./PackagesScreen";

export default function PhotographerPackagesPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Packages"
        lede="Coverage options, deliverables, and PKR pricing shown on your profile."
      />
      <Suspense fallback={<PackagesSkeleton />}>
        <PackagesScreen />
      </Suspense>
    </div>
  );
}

