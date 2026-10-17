import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";
import { BookingFormClient } from "./BookingFormClient";

export function generateStaticParams() {
  return MOCK_PHOTOGRAPHERS.map((p) => ({
    photographerId: p.id,
  }));
}

export default async function BookingPage({
  params,
}: {
  params: Promise<{ photographerId: string }>;
}) {
  const { photographerId } = await params;

  const photographer =
    MOCK_PHOTOGRAPHERS.find((p) => p.id === photographerId) ||
    MOCK_PHOTOGRAPHERS.find((p) => p.id === `ph-${photographerId}`) ||
    MOCK_PHOTOGRAPHERS[0];

  if (!photographer) {
    notFound();
  }

  return (
    <Suspense
      fallback={
        <div className="max-w-[1120px] mx-auto px-6 py-12 text-slate font-sans">
          Loading booking form...
        </div>
      }
    >
      <BookingFormClient photographer={photographer} />
    </Suspense>
  );
}
