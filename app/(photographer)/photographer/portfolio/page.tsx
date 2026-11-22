import React, { Suspense } from "react";
import { SectionHeader } from "@/components/patterns";
import { PortfolioScreen, PortfolioSkeleton } from "./PortfolioScreen";

export default function PhotographerPortfolioPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Portfolio"
        lede="Upload and order the photographs clients see on your profile."
      />
      <Suspense fallback={<PortfolioSkeleton />}>
        <PortfolioScreen />
      </Suspense>
    </div>
  );
}

