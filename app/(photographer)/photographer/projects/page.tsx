import React, { Suspense } from "react";
import { SectionHeader } from "@/components/patterns";
import { ProjectsScreen, ProjectsSkeleton } from "./ProjectsScreen";

export default function PhotographerProjectsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader
        title="Projects & shoots"
        lede="Track accepted bookings through mock deposit, on-location shoot, gallery delivery, and completion."
      />
      <Suspense fallback={<ProjectsSkeleton />}>
        <ProjectsScreen />
      </Suspense>
    </div>
  );
}

