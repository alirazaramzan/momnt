import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";
import { loadPublicPhotographerWithPackages } from "@/lib/photographers/public-packages";
import { BookingFormClient } from "./BookingFormClient";

export function generateStaticParams() {
  return MOCK_PHOTOGRAPHERS.map((p) => ({
    photographerId: p.id,
  }));
}

async function BookingPageContent({
  params,
}: {
  params: Promise<{ photographerId: string }>;
}) {
  const { photographerId } = await params;
  const photographer = await loadPublicPhotographerWithPackages(photographerId);

  if (!photographer) {
    notFound();
  }

  return <BookingFormClient photographer={photographer} />;
}

export default function BookingPage({
  params,
}: {
  params: Promise<{ photographerId: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="max-w-[1120px] mx-auto px-6 py-12 text-slate font-sans">
          Loading booking form...
        </div>
      }
    >
      <BookingPageContent params={params} />
    </Suspense>
  );
}
