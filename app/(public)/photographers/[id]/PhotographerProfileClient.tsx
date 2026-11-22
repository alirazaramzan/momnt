"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Photographer, PortfolioItem } from "@/lib/types";
import { VerifiedBadge, PhotoPlaceholder } from "@/components/brand";
import { MonthCalendar, PackageRow } from "@/components/patterns";
import { Button, Chip } from "@/components/ui";
import { formatPackageDetail } from "@/lib/validators/packages";

export interface PhotographerProfileClientProps {
  photographer: Photographer;
}

const DEFAULT_PLACEHOLDERS: PortfolioItem[] = [
  {
    id: "placeholder-1",
    tone: "warm",
    caption: "Mehndi",
    number: "014",
    event: "Mehndi",
    aperture: "f/1.8",
    aspect: "3/2",
  },
  {
    id: "placeholder-2",
    tone: "midnight",
    caption: "Portrait",
    number: "015",
    event: "Portrait",
    aperture: "f/1.4",
    aspect: "4/3",
  },
  {
    id: "placeholder-3",
    tone: "slate",
    caption: "Couple",
    number: "016",
    event: "Couple",
    aperture: "f/2.0",
    aspect: "4/3",
  },
  {
    id: "placeholder-4",
    tone: "dune",
    caption: "Mehndi",
    number: "017",
    event: "Mehndi",
    aperture: "f/2.8",
    aspect: "4/3",
  },
];

function PortfolioFrame({
  item,
  photographerName,
  hero = false,
}: {
  item: PortfolioItem;
  photographerName: string;
  hero?: boolean;
}) {
  const frameNumber =
    typeof item.number === "number"
      ? String(item.number).padStart(3, "0")
      : item.number || "001";

  // When a real uploaded image URL exists, render the untouched photograph
  // with photographer credit and frame caption (AGENTS.md: never tint, filter,
  // or watermark photographs; always credit the photographer beside their work).
  if (item.src) {
    return (
      <figure className="space-y-1.5 w-full">
        <div
          className={`relative w-full overflow-hidden rounded-[2px] border border-[#CFCFCB] bg-mist/20 ${
            hero
              ? "aspect-[3/2] min-h-[300px] sm:min-h-[360px] lg:min-h-[380px]"
              : "aspect-[4/3]"
          }`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.src}
            alt={
              item.caption
                ? `${item.caption} by ${photographerName}`
                : `Portfolio frame ${frameNumber} by ${photographerName}`
            }
            className="size-full object-cover"
          />
        </div>
        <figcaption className="flex items-center justify-between gap-2 font-sans text-xs text-slate tabular-nums">
          <span className="truncate">
            No. {frameNumber}
            {item.caption ? `, ${item.caption}` : ""}
          </span>
          <span className="shrink-0">{item.credit || photographerName}</span>
        </figcaption>
      </figure>
    );
  }

  return (
    <PhotoPlaceholder
      tone={item.tone || "warm"}
      aspect={hero ? "3/2" : item.aspect || "4/3"}
      withCorners={false}
      credit={item.credit || photographerName}
      caption={
        item.event && item.aperture
          ? {
              number: frameNumber,
              event: item.event,
              aperture: item.aperture,
            }
          : item.caption
          ? `No. ${frameNumber}, ${item.caption}`
          : `No. ${frameNumber}`
      }
      className={
        hero
          ? "w-full min-h-[300px] sm:min-h-[360px] lg:min-h-[380px]"
          : "w-full"
      }
    />
  );
}

export function PhotographerProfileClient({
  photographer,
}: PhotographerProfileClientProps) {
  const router = useRouter();

  // Packages read from the server component via `photographer.packages`
  const packages = photographer.packages.map((pkg, index) => ({
    id: pkg.id || `pkg-${index}`,
    name: pkg.name,
    detail: formatPackageDetail({
      hours: pkg.hours,
      photographers: pkg.photographers,
      editedPhotos: pkg.editedPhotos,
      deliveryTime: pkg.deliveryTime,
      addons: pkg.addons,
    }),
    price: pkg.price,
  }));

  // State for selected package (default to first package)
  const [selectedPackageId, setSelectedPackageId] = useState<string>(
    packages[0]?.id ?? ""
  );

  // Availability summary from the server component
  const availability = photographer.availabilitySummary ?? {
    month: "December",
    year: 2026,
    daysCount: 31,
    firstDayOffset: 1,
    bookedDates: [4, 5, 11, 12, 19, 26],
    defaultSelectedDate: 14,
  };

  // State for selected calendar date
  const [selectedDate, setSelectedDate] = useState<number | null>(
    availability.defaultSelectedDate
  );

  // Portfolio frames: real uploaded portfolio images when present, otherwise placeholders
  const portfolioItems =
    photographer.portfolio && photographer.portfolio.length > 0
      ? photographer.portfolio
      : DEFAULT_PLACEHOLDERS;

  const heroFrame = portfolioItems[0];
  const secondaryFrames = portfolioItems.slice(1, 4);
  const additionalFrames = portfolioItems.slice(4);

  // Review stats (average rating and count, which can be zero)
  const reviewCount =
    photographer.reviewStats?.reviewCount ??
    photographer.reviews?.length ??
    0;
  const averageRating =
    photographer.reviewStats?.averageRating ??
    (reviewCount > 0 ? photographer.rating : 0);

  const handleRequestDate = () => {
    const shortMonth = availability.month.slice(0, 3);
    const dateParam = selectedDate
      ? `${selectedDate}-${shortMonth}`
      : photographer.nextFree.replace(/\s+/g, "-");
    const pkgQuery = selectedPackageId
      ? `&package=${encodeURIComponent(selectedPackageId)}`
      : "";
    router.push(`/book/${photographer.id}?date=${dateParam}${pkgQuery}`);
  };

  const subtitleParts = [
    photographer.city,
    photographer.specialisations.length > 0
      ? photographer.specialisations.join(" and ").toLowerCase()
      : null,
  ].filter(Boolean);

  return (
    <div className="w-full bg-chalk text-midnight py-6 sm:py-8 lg:py-10">
      <div className="max-w-[1120px] mx-auto px-6 space-y-12">
        {/* Owner / Admin preview notice when photographer is not yet verified */}
        {photographer.isPreviewForOwnerOrAdmin && (
          <div
            role="status"
            aria-label="Unverified profile preview notice"
            className="border border-brass rounded-[2px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <p className="font-sans text-sm text-midnight">
              Preview mode ({photographer.status.replace("_", " ")}). This profile is only visible to you and Momnt admins until verification is approved.
            </p>
            <Chip variant="brass-outline" size="sm">
              {photographer.status === "under_review"
                ? "Under review"
                : photographer.status === "rejected"
                ? "Rejected"
                : "Pending verification"}
            </Chip>
          </div>
        )}

        {/* Top 2-column profile layout (1.3fr and 1fr at >=1024px, 1 column below) */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Left Column: Portfolio Photos (at 390px, this comes first) */}
          <div className="space-y-3 w-full">
            {heroFrame && (
              <div className="w-full">
                <PortfolioFrame
                  item={heroFrame}
                  photographerName={photographer.name}
                  hero
                />
              </div>
            )}

            {secondaryFrames.length > 0 && (
              <div className="grid grid-cols-3 gap-3 w-full">
                {secondaryFrames.map((frame) => (
                  <PortfolioFrame
                    key={frame.id}
                    item={frame}
                    photographerName={photographer.name}
                  />
                ))}
              </div>
            )}

            {additionalFrames.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full pt-2">
                {additionalFrames.map((frame) => (
                  <PortfolioFrame
                    key={frame.id}
                    item={frame}
                    photographerName={photographer.name}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Name, VerifiedBadge, Bio, Packages, Calendar, Action button */}
          <div className="space-y-6 text-left">
            {/* Name, VerifiedBadge, Location & Review Summary */}
            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-[32px] leading-tight font-normal text-midnight">
                  {photographer.name}
                </h1>
                {photographer.verified && <VerifiedBadge variant="solid" />}
              </div>
              <p className="font-sans text-xs sm:text-sm text-slate">
                {subtitleParts.join(", ")}
              </p>
              <p className="font-sans text-xs text-slate tabular-nums">
                {reviewCount > 0
                  ? `${averageRating.toFixed(1)} average rating · ${reviewCount} ${
                      reviewCount === 1 ? "review" : "reviews"
                    } · Next free ${photographer.nextFree}`
                  : `No reviews yet (0 reviews) · Next free ${photographer.nextFree}`}
              </p>
              {photographer.bio && (
                <p className="font-sans text-sm text-midnight leading-relaxed pt-1">
                  {photographer.bio}
                </p>
              )}
            </div>

            {/* Packages Section */}
            <div className="space-y-2 pt-2 border-t border-[#CFCFCB]">
              <div className="font-sans text-xs font-semibold text-slate">
                Packages
              </div>
              {packages.length === 0 ? (
                <p className="font-sans text-xs text-slate py-2">
                  No packages listed yet. Contact {photographer.name} for custom coverage.
                </p>
              ) : (
                <div
                  className="space-y-1.5"
                  role="radiogroup"
                  aria-label="Available packages"
                >
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
              )}
            </div>

            {/* MonthCalendar Section */}
            <div className="space-y-2 pt-2 border-t border-[#CFCFCB]">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-sans text-xs font-semibold text-slate">
                    Availability
                  </span>
                  <span className="font-sans text-xs text-slate tabular-nums">
                    Next free: {photographer.nextFree}
                  </span>
                </div>
                <MonthCalendar
                  month={availability.month}
                  year={availability.year}
                  daysCount={availability.daysCount}
                  firstDayOffset={availability.firstDayOffset}
                  bookedDates={availability.bookedDates}
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
              <p className="font-sans text-xs sm:text-sm text-slate tabular-nums">
                {reviewCount > 0
                  ? `${averageRating.toFixed(1)} out of 5 across ${reviewCount} verified ${
                      reviewCount === 1 ? "booking" : "bookings"
                    }.`
                  : "0 reviews yet. Reviews appear here after completed bookings."}
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

          {/* Reviews list: real database reviews if present, empty state if 0, or mock sample reviews for mock profiles */}
          {photographer.reviews ? (
            photographer.reviews.length === 0 ? (
              <div className="p-6 rounded-[2px] border border-[#CFCFCB] bg-card">
                <p className="font-sans text-sm text-slate">
                  No client reviews yet. Book {photographer.name} to be their first verified review on Momnt.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {photographer.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-5 rounded-[2px] border border-[#CFCFCB] bg-card space-y-3 flex flex-col justify-between"
                  >
                    <p className="font-sans text-sm text-midnight leading-relaxed">
                      {rev.comment || `Rated ${rev.rating} out of 5.`}
                    </p>
                    <div className="font-sans text-xs text-slate pt-1 border-t border-border/50 tabular-nums">
                      {rev.reviewerName} &middot; {rev.rating}/5
                      {rev.dateLabel ? ` · ${rev.dateLabel}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
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
          )}
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
