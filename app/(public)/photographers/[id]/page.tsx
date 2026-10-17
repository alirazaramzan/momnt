import React from "react";
import { notFound } from "next/navigation";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";
import { PhotographerProfileClient } from "./PhotographerProfileClient";

export function generateStaticParams() {
  return MOCK_PHOTOGRAPHERS.map((p) => ({
    id: p.id,
  }));
}

export default async function PhotographerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const photographer =
    MOCK_PHOTOGRAPHERS.find((p) => p.id === id) ||
    MOCK_PHOTOGRAPHERS[0]; // fallback gracefully to Sara Khan

  if (!photographer) {
    notFound();
  }

  return <PhotographerProfileClient photographer={photographer} />;
}
