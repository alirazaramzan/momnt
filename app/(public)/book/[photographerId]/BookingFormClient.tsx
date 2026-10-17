"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Photographer } from "@/lib/types";
import {
  Button,
  Input,
  Select,
  Textarea,
  Label,
  Stepper,
} from "@/components/ui";
import { PackageRow } from "@/components/patterns";
import { VerifiedBadge } from "@/components/brand";

export interface BookingFormClientProps {
  photographer: Photographer;
  initialDate?: string;
  initialPackageId?: string;
}

const EVENT_OPTIONS = [
  "Mehndi",
  "Barat",
  "Walima",
  "Nikah",
  "Portrait session",
  "Corporate event",
];

export function BookingFormClient({
  photographer,
  initialDate,
  initialPackageId,
}: BookingFormClientProps) {
  const searchParams = useSearchParams();
  const queryDate = searchParams?.get("date") || undefined;
  const queryPackage = searchParams?.get("package") || undefined;

  // Form fields state
  const [event, setEvent] = useState("Mehndi");
  const [date, setDate] = useState(
    initialDate || queryDate || photographer.nextFree || "14 December"
  );
  const [startTime, setStartTime] = useState("6:00 pm");
  const [guests, setGuests] = useState("250");
  const [venue, setVenue] = useState("Clifton, Karachi");
  const [notes, setNotes] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(
    initialPackageId ||
      queryPackage ||
      photographer.packages[0]?.id ||
      photographer.packages[0]?.name ||
      ""
  );

  // Interaction states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Selected package details
  const selectedPackage =
    photographer.packages.find((p) => (p.id || p.name) === selectedPackageId) ||
    photographer.packages[0];

  // 25% demo deposit calculation rounded to nearest thousand
  const depositAmount = selectedPackage
    ? Math.round((selectedPackage.price * 0.25) / 1000) * 1000
    : 0;

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!event.trim()) {
      nextErrors.event = "Select an event type.";
    }
    if (!date.trim()) {
      nextErrors.date = "Enter your planned date.";
    }
    if (!startTime.trim()) {
      nextErrors.startTime = "Enter event start time.";
    }
    if (!guests.trim() || Number(guests) < 1) {
      nextErrors.guests = "Enter estimated guest count.";
    }
    if (!venue.trim()) {
      nextErrors.venue = "Enter venue or area.";
    }
    if (!selectedPackageId) {
      nextErrors.package = "Select a photography package.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 800);
  };

  // Success Confirmation State
  if (isSubmitted) {
    const firstName = photographer.name.split(" ")[0];
    const replyText = photographer.replyTime
      ? photographer.replyTime.startsWith("within")
        ? photographer.replyTime
        : `within ${photographer.replyTime}`
      : "within the hour";

    return (
      <div className="max-w-[640px] mx-auto px-6 py-12 md:py-16">
        <div className="border border-[#CFCFCB] bg-chalk p-8 rounded-[2px] space-y-6">
          <div className="space-y-2">
            <p className="font-sans text-xs text-slate">Booking request</p>
            <h1 className="font-serif text-[32px] md:text-[36px] text-midnight leading-tight">
              Request sent
            </h1>
            <p className="font-sans text-base text-slate leading-relaxed">
              Request sent. {firstName} usually replies {replyText}.
            </p>
          </div>

          <div className="border-t border-b border-[#CFCFCB] py-5 space-y-3">
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Photographer</span>
              <span className="font-medium text-midnight flex items-center gap-1.5">
                {photographer.name}
                {photographer.verified && <VerifiedBadge />}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Event & date</span>
              <span className="font-medium text-midnight tabular-nums">
                {event} &bull; {date}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Time & guests</span>
              <span className="font-medium text-midnight tabular-nums">
                {startTime} &bull; {guests} guests
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Venue</span>
              <span className="font-medium text-midnight">{venue}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Package</span>
              <span className="font-medium text-midnight">
                {selectedPackage?.name}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Deposit (demo)</span>
              <span className="font-semibold tabular-nums text-midnight">
                PKR {depositAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-2.5">
            <span className="text-xs font-sans text-slate">Current status</span>
            <Stepper
              steps={["Requested", "Accepted", "Deposit", "Delivered"]}
              currentStep={0}
            />
          </div>

          <div className="pt-2">
            <Link href="/client" className="inline-block">
              <Button variant="quiet" size="md">
                View booking &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active Booking Form
  return (
    <div className="max-w-[1120px] mx-auto px-6 py-8 md:py-12">
      {/* Top context header */}
      <div className="mb-8">
        <Link
          href={`/photographers/${photographer.id}`}
          className="font-sans text-xs text-slate hover:text-midnight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px] transition-colors mb-2 inline-block"
        >
          &larr; Back to {photographer.name}
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-[32px] md:text-[36px] text-midnight leading-tight">
            Booking {photographer.name}
          </h1>
          {photographer.verified && <VerifiedBadge />}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Left Column: Form Fields */}
          <div className="space-y-6">
            {/* Grid for Event, Date, Start time, Guests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-select">Event</Label>
                <Select
                  id="event-select"
                  value={event}
                  onChange={(e) => {
                    setEvent(e.target.value);
                    if (errors.event) {
                      setErrors((prev) => ({ ...prev, event: "" }));
                    }
                  }}
                  className={errors.event ? "border-alert" : ""}
                >
                  {EVENT_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </Select>
                {errors.event && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.event}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="booking-date">Date</Label>
                <Input
                  id="booking-date"
                  type="text"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: "" }));
                    }
                  }}
                  placeholder="e.g. 14 December"
                  className={errors.date ? "border-alert" : ""}
                />
                {errors.date && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.date}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="start-time">Start time</Label>
                <Input
                  id="start-time"
                  type="text"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    if (errors.startTime) {
                      setErrors((prev) => ({ ...prev, startTime: "" }));
                    }
                  }}
                  placeholder="e.g. 6:00 pm"
                  className={errors.startTime ? "border-alert" : ""}
                />
                {errors.startTime && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="guest-count">Guests</Label>
                <Input
                  id="guest-count"
                  type="number"
                  min="1"
                  value={guests}
                  onChange={(e) => {
                    setGuests(e.target.value);
                    if (errors.guests) {
                      setErrors((prev) => ({ ...prev, guests: "" }));
                    }
                  }}
                  placeholder="e.g. 250"
                  className={errors.guests ? "border-alert" : ""}
                />
                {errors.guests && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.guests}
                  </p>
                )}
              </div>
            </div>

            {/* Venue field */}
            <div>
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                type="text"
                value={venue}
                onChange={(e) => {
                  setVenue(e.target.value);
                  if (errors.venue) {
                    setErrors((prev) => ({ ...prev, venue: "" }));
                  }
                }}
                placeholder="e.g. Clifton, Karachi"
                className={errors.venue ? "border-alert" : ""}
              />
              {errors.venue && (
                <p className="text-xs text-alert font-sans mt-1">
                  {errors.venue}
                </p>
              )}
            </div>

            {/* Anything we should know */}
            <div>
              <Label htmlFor="anything-we-should-know" optional>
                Anything we should know
              </Label>
              <Textarea
                id="anything-we-should-know"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Stage orientation, family groups, daylight preferences, specific shots..."
                className="min-h-[88px]"
              />
            </div>

            {/* Package radio group */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label id="package-group-label" className="mb-0">
                  Package
                </Label>
                <span className="text-xs font-sans text-slate">
                  Choose coverage
                </span>
              </div>

              <div
                role="radiogroup"
                aria-labelledby="package-group-label"
                className="space-y-2"
              >
                {photographer.packages.map((pkg, idx) => {
                  const pkgKey = pkg.id || pkg.name || `pkg-${idx}`;
                  const isSelected = selectedPackageId === pkgKey;
                  const detailLine = `${pkg.hours} hours • ${pkg.photographers} ${
                    pkg.photographers === 1 ? "photographer" : "photographers"
                  }${pkg.editedPhotos > 0 ? ` • ${pkg.editedPhotos} edited` : ` • ${pkg.deliveryTime}`}`;

                  return (
                    <PackageRow
                      key={pkgKey}
                      name={pkg.name}
                      detail={detailLine}
                      price={pkg.price}
                      selected={isSelected}
                      onClick={() => {
                        setSelectedPackageId(pkgKey);
                        if (errors.package) {
                          setErrors((prev) => ({ ...prev, package: "" }));
                        }
                      }}
                      role="radio"
                      aria-checked={isSelected}
                      className="border border-[#CFCFCB] rounded-[2px]"
                    />
                  );
                })}
              </div>
              {errors.package && (
                <p className="text-xs text-alert font-sans mt-1">
                  {errors.package}
                </p>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Summary & Action */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="border border-[#CFCFCB] bg-chalk p-6 rounded-[2px]">
              {/* Title in Bodoni Moda at 22px */}
              <h2 className="font-serif text-[22px] leading-[30px] font-normal text-midnight mb-4">
                Your request
              </h2>

              {/* Summary Rows */}
              <div className="divide-y divide-[#CFCFCB]">
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm font-sans text-slate">Package</span>
                  <span className="text-sm font-sans font-medium text-midnight text-right truncate max-w-[200px]">
                    {selectedPackage?.name ?? "None selected"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm font-sans text-slate">
                    Deposit (demo)
                  </span>
                  <span className="font-sans font-semibold tabular-nums text-midnight text-right text-sm">
                    PKR {depositAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Status Path Stepper */}
              <div className="py-4 border-b border-[#CFCFCB]">
                <div className="text-xs font-sans text-slate mb-2.5">
                  Status path
                </div>
                <Stepper
                  steps={["Requested", "Accepted", "Deposit", "Delivered"]}
                  currentStep={0}
                />
              </div>

              {/* Cancellation & Reschedule Rules (visible beside/above button, never behind a link) */}
              <p className="text-xs text-slate font-sans leading-relaxed my-4">
                Free to reschedule up to 14 days before. After that the deposit is
                held. [CONFIRM RULES]
              </p>

              {/* Single Primary Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-sm font-semibold"
                loading={isSubmitting}
              >
                Send request
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
