import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";
import { loadPublicPhotographerWithPackages } from "@/lib/photographers/public-packages";
import { PhotographerProfileClient } from "./PhotographerProfileClient";

export function generateStaticParams() {
  return MOCK_PHOTOGRAPHERS.map((p) => ({
    id: p.id,
  }));
}

async function PhotographerProfileContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photographer = await loadPublicPhotographerWithPackages(id);

  if (!photographer) {
    notFound();
  }

  return <PhotographerProfileClient photographer={photographer} />;
}

export default function PhotographerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1120px] mx-auto px-6 py-12 text-slate font-sans text-sm">
          Loading profile...
        </div>
      }
    >
      <PhotographerProfileContent params={params} />
    </Suspense>
  );
}
