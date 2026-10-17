"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Photographer } from "@/lib/types";
import { SAMPLE_PRICES } from "@/lib/mock/prices";
import { VerifiedBadge, PhotoPlaceholder } from "@/components/brand";
import { MonthCalendar, PackageRow } from "@/components/patterns";
import { Button } from "@/components/ui";

export interface PhotographerProfileClientProps {
  photographer: Photographer;
}

export function PhotographerProfileClient({
  photographer,
}: PhotographerProfileClientProps) {
  const router = useRouter();

  // State for selected package (default to first package)
  const [selectedPackageId, setSelectedPackageId] = useState<string>("mehndi");

  // State for selected calendar date (default to 14, matching nextFree "14 Dec")
  const [selectedDate, setSelectedDate] = useState<number | null>(14);

  // Booked dates in December for Sara Khan
  const bookedDates = [4, 5, 11, 12, 19, 26];

  // Packages with prices from /lib/mock/prices
  const packages = [
    {
      id: "mehndi",
      name: "Mehndi, 6 hours",
      detail: "2 photographers, 300 edited",
      price: SAMPLE_PRICES.photographers.saraKhan.mehndiSixHours, // 120,000 PKR
    },
    {
      id: "wedding",
      name: "Full wedding, 3 days",
      detail: "Delivery in 4 weeks",
      price: SAMPLE_PRICES.photographers.saraKhan.fullWeddingTwelveHours, // 240,000 PKR
    },
  ];

  const handleRequestDate = () => {
    // Route to booking flow with date and package prefilled
    const dateParam = selectedDate ? `${selectedDate}-Dec` : "14-Dec";
    router.push(`/client?book=${photographer.id}&date=${dateParam}&package=${selectedPackageId}`);
  };

  return (
    <div className="w-full bg-chalk text-midnight py-6 sm:py-8 lg:py-10">
      <div className="max-w-[1120px] mx-auto px-6 space-y-12">
        {/* Top 2-column profile layout (1.3fr and 1fr at >=1024px, 1 column below) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Left Column: Photos (at 390px, this comes first) */}
          <div className="space-y-3 w-full">
            {/* One large PhotoPlaceholder (min height 300px, warm tone, CameraCaption "No. 014, Mehndi, f/1.8") */}
            <div className="w-full">
              <PhotoPlaceholder
                tone="warm"
                aspect="3/2"
                withCorners={false}
                caption={{
                  number: "014",
                  event: "Mehndi",
                  aperture: "f/1.8",
                }}
                className="w-full min-h-[300px] sm:min-h-[360px] lg:min-h-[380px]"
              />
            </div>

            {/* Row of three smaller placeholders below it */}
            <div className="grid grid-cols-3 gap-3 w-full">
              <PhotoPlaceholder
                tone="midnight"
                aspect="4/3"
                withCorners={false}
                caption={{
                  number: "015",
                  event: "Portrait",
                  aperture: "f/1.4",
                }}
                className="w-full"
              />
              <PhotoPlaceholder
                tone="slate"
                aspect="4/3"
                withCorners={false}
                caption={{
                  number: "016",
                  event: "Couple",
                  aperture: "f/2.0",
                }}
                className="w-full"
              />
              <PhotoPlaceholder
                tone="dune"
                aspect="4/3"
                withCorners={false}
                caption={{
                  number: "017",
                  event: "Mehndi",
                  aperture: "f/2.8",
                }}
                className="w-full"
              />
            </div>
          </div>

          {/* Right Column: Name, VerifiedBadge, Packages, Calendar, Action button */}
          <div className="space-y-6 text-left">
            {/* Name and Identity */}
            <div className="space-y-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-[32px] leading-tight font-normal text-midnight">
                  {photographer.name}
                </h1>
                {/* VerifiedBadge appears only here and in cards, never decoratively */}
                {photographer.verified && <VerifiedBadge variant="solid" />}
              </div>
              <p className="font-sans text-xs sm:text-sm text-slate">
                {photographer.city}, {photographer.specialisations.join(" and ").toLowerCase()}
              </p>
            </div>

            {/* Packages Section with two PackageRows */}
            <div className="space-y-2 pt-2 border-t border-[#CFCFCB]">
              <div className="font-sans text-xs font-semibold text-slate">
                Packages
              </div>
              <div className="space-y-1.5" role="radiogroup" aria-label="Available packages">
                {packages.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <PackageRow
                      key={pkg.id}
                      name={pkg.name}
                      detail={pkg.detail}
                      price={pkg.price}
                      selected={isSelected}
                      onClick={() => setSelectedPackageId(pkg.id)}
                    />
                  );
                })}
              </div>
            </div>

            {/* MonthCalendar Section for next free month (December) */}
            <div className="space-y-2 pt-2 border-t border-[#CFCFCB]">
              <div className="space-y-1">
                <div className="font-sans text-xs font-semibold text-slate">
                  Availability
                </div>
                <MonthCalendar
                  month="December"
                  year={2026}
                  daysCount={31}
                  firstDayOffset={1}
                  bookedDates={bookedDates}
                  selectedDate={selectedDate}
                  onSelect={(date) => setSelectedDate(date)}
                  className="w-full max-w-full"
                />
              </div>
              <p className="font-sans text-xs text-slate">
                Outlined is free, grey is booked.
              </p>
            </div>

            {/* Primary Action Button (Desktop: visible without scrolling at 1440px) */}
            <div className="pt-2 hidden lg:block">
              <Button
                variant="primary"
                size="lg"
                onClick={handleRequestDate}
                className="w-full"
              >
                Request this date
              </Button>
            </div>
          </div>
        </div>

        {/* Below the two columns: Reviews Section & Quiet Compare Button */}
        <div className="pt-10 border-t border-[#CFCFCB] space-y-6 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="font-display text-[26px] sm:text-[28px] font-normal leading-tight text-midnight">
                Client reviews
              </h2>
              <p className="font-sans text-xs sm:text-sm text-slate">
                Verified feedback from past wedding and portrait bookings.
              </p>
            </div>

            {/* Quiet Compare Button */}
            <div>
              <Button
                variant="quiet"
                size="md"
                onClick={() => router.push("/photographers")}
                className="text-sm font-sans font-medium text-midnight hover:underline"
              >
                Compare photographer
              </Button>
            </div>
          </div>

          {/* Three reviews, sentence case, name and date in slate */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-[2px] border border-[#CFCFCB] bg-card space-y-3">
              <p className="font-sans text-sm text-midnight leading-relaxed">
                Sara was quiet, unhurried, and captured moments our family will treasure for decades. The daylight portraits turned out better than we imagined.
              </p>
              <div className="font-sans text-xs text-slate pt-1 border-t border-border/50">
                Amina &amp; Bilal &middot; Clifton, Karachi &middot; Dec 2025
              </div>
            </div>

            <div className="p-5 rounded-[2px] border border-[#CFCFCB] bg-card space-y-3">
              <p className="font-sans text-sm text-midnight leading-relaxed">
                Working with Sara on our three-day wedding was calm from start to finish. Delivered every edited frame well ahead of deadline.
              </p>
              <div className="font-sans text-xs text-slate pt-1 border-t border-border/50">
                Zainab Tariq &middot; DHA, Karachi &middot; Nov 2025
              </div>
            </div>

            <div className="p-5 rounded-[2px] border border-[#CFCFCB] bg-card space-y-3">
              <p className="font-sans text-sm text-midnight leading-relaxed">
                Honest colour, real emotions, and zero awkward posing. Worth every rupee for our family.
              </p>
              <div className="font-sans text-xs text-slate pt-1 border-t border-border/50">
                Hamza Siddiqui &middot; PECHS, Karachi &middot; Oct 2025
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Button (<1024px / 390px): "Request this date" */}
      <div className="fixed bottom-0 inset-x-0 p-4 bg-chalk/95 backdrop-blur-xs border-t border-[#CFCFCB] z-30 lg:hidden shadow-menu">
        <Button
          variant="primary"
          size="lg"
          onClick={handleRequestDate}
          className="w-full"
        >
          Request this date
        </Button>
      </div>

      {/* Spacer on mobile so content is not obscured by the sticky bottom button */}
      <div className="h-20 lg:hidden" aria-hidden="true" />
    </div>
  );
}
