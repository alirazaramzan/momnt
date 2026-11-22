"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { VerifiedBadge } from "@/components/brand";
import { PackageRow } from "@/components/patterns";
import {
  Button,
  Input,
  Label,
  Select,
  Stepper,
  Textarea,
} from "@/components/ui";
import { submitBookingRequest } from "@/lib/booking/actions";
import {
  BOOKING_RULES_CONFIG,
  calculateDepositAmount,
} from "@/lib/booking/config";
import type { Photographer } from "@/lib/types";
import {
  formatIsoDateHuman,
  formatSqlTimeHuman,
  parseFlexibleDateToIso,
  type CreatedBookingSummary,
} from "@/lib/validators/booking";

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

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function BookingFormClient({
  photographer,
  initialDate,
  initialPackageId,
}: BookingFormClientProps) {
  const searchParams = useSearchParams();
  const queryDate = searchParams?.get("date") || undefined;
  const queryPackage = searchParams?.get("package") || undefined;

  const defaultPackage =
    photographer.packages.find(
      (p) => (p.id || p.name) === (initialPackageId || queryPackage)
    ) || photographer.packages[0];

  const defaultIsoDate =
    parseFlexibleDateToIso(
      initialDate || queryDate || photographer.nextFree,
      photographer.availabilitySummary?.year ?? new Date().getUTCFullYear()
    ) || "2026-12-14";

  // Form fields state
  const [event, setEvent] = useState("Mehndi");
  const [date, setDate] = useState(defaultIsoDate);
  const [startTime, setStartTime] = useState("6:00 pm");
  const [durationHours, setDurationHours] = useState(
    defaultPackage ? String(defaultPackage.hours) : "6"
  );
  const [guests, setGuests] = useState("250");
  const [budget, setBudget] = useState(
    defaultPackage ? String(defaultPackage.price) : "120000"
  );
  const [venue, setVenue] = useState(
    photographer.city ? `Clifton, ${photographer.city}` : "Clifton, Karachi"
  );
  const [notes, setNotes] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState(
    defaultPackage?.id || defaultPackage?.name || ""
  );

  // Interaction states
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const [createdBooking, setCreatedBooking] =
    useState<CreatedBookingSummary | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Selected package details (display preview; actual price is enforced on the server)
  const selectedPackage =
    photographer.packages.find((p) => (p.id || p.name) === selectedPackageId) ||
    photographer.packages[0];

  const previewPrice = selectedPackage?.price ?? 0;
  const depositAmount = calculateDepositAmount(previewPrice);

  const unavailableSet = new Set(photographer.unavailableIsoDates ?? []);
  const parsedIso = parseFlexibleDateToIso(date);
  const isDateMarkedUnavailable = parsedIso
    ? unavailableSet.has(parsedIso)
    : false;

  const validateLocal = () => {
    const nextErrors: Record<string, string> = {};

    if (!event.trim()) {
      nextErrors.event = "Select an event type.";
    }
    if (!date.trim() || !parseFlexibleDateToIso(date)) {
      nextErrors.date = "Enter a valid planned date (e.g. 2026-12-14).";
    } else if (isDateMarkedUnavailable) {
      nextErrors.date =
        "This date is already booked or unavailable on the photographer's calendar.";
    }
    if (!startTime.trim()) {
      nextErrors.startTime = "Enter event start time.";
    }
    if (
      durationHours.trim() &&
      (Number(durationHours) < 1 || Number(durationHours) > 168)
    ) {
      nextErrors.durationHours = "Enter duration between 1 and 168 hours.";
    }
    if (!guests.trim() || Number(guests) < 1) {
      nextErrors.guests = "Enter estimated guest count.";
    }
    if (budget.trim() && Number(budget) < 1) {
      nextErrors.budget = "Enter a positive budget in PKR.";
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
    setFormError("");
    if (!validateLocal()) {
      return;
    }

    // Legacy mock photographers (non-UUID IDs) keep the demo confirmation flow
    if (
      !UUID_REGEX.test(photographer.id) ||
      !selectedPackage?.id ||
      !UUID_REGEX.test(selectedPackage.id)
    ) {
      const iso = parseFlexibleDateToIso(date) || "2026-12-14";
      setCreatedBooking({
        id: "demo-booking",
        event_type: event,
        event_date: iso,
        start_time: "18:00:00",
        location: venue,
        duration_hours: Number(durationHours) || selectedPackage?.hours || 6,
        guests: Number(guests) || 250,
        budget: Number(budget) || previewPrice,
        requirements: notes.trim() || null,
        package_id: selectedPackage?.id || "demo-pkg",
        package_name: selectedPackage?.name || "Coverage package",
        price: previewPrice,
        deposit_amount: depositAmount,
        status: "requested",
      });
      setIsSubmitted(true);
      return;
    }

    startTransition(async () => {
      const result = await submitBookingRequest({
        photographer_id: photographer.id,
        package_id: selectedPackage.id,
        event_type: event,
        event_date: date,
        start_time: startTime,
        location: venue,
        duration_hours: durationHours ? Number(durationHours) : null,
        guests: Number(guests),
        budget: budget ? Number(budget) : null,
        requirements: notes,
      });

      if (result.ok) {
        setCreatedBooking(result.booking);
        setIsSubmitted(true);
      } else {
        const mappedErrors: Record<string, string> = {};
        if (result.fieldErrors.event_type)
          mappedErrors.event = result.fieldErrors.event_type;
        if (result.fieldErrors.event_date)
          mappedErrors.date = result.fieldErrors.event_date;
        if (result.fieldErrors.start_time)
          mappedErrors.startTime = result.fieldErrors.start_time;
        if (result.fieldErrors.duration_hours)
          mappedErrors.durationHours = result.fieldErrors.duration_hours;
        if (result.fieldErrors.guests)
          mappedErrors.guests = result.fieldErrors.guests;
        if (result.fieldErrors.budget)
          mappedErrors.budget = result.fieldErrors.budget;
        if (result.fieldErrors.location)
          mappedErrors.venue = result.fieldErrors.location;
        if (result.fieldErrors.package_id)
          mappedErrors.package = result.fieldErrors.package_id;
        if (result.fieldErrors.requirements)
          mappedErrors.notes = result.fieldErrors.requirements;

        setErrors(mappedErrors);
        setFormError(result.formError ?? "");
      }
    });
  };

  // Success Confirmation State
  if (isSubmitted) {
    const firstName = photographer.name.split(" ")[0];
    const replyText = photographer.replyTime
      ? photographer.replyTime.startsWith("within")
        ? photographer.replyTime
        : `within ${photographer.replyTime}`
      : "within the hour";

    const displayDate = createdBooking
      ? formatIsoDateHuman(createdBooking.event_date, "long")
      : date;
    const displayTime = createdBooking
      ? formatSqlTimeHuman(createdBooking.start_time)
      : startTime;
    const displayPrice = createdBooking?.price ?? previewPrice;
    const displayDeposit = createdBooking?.deposit_amount ?? depositAmount;
    const displayPackageName =
      createdBooking?.package_name ?? selectedPackage?.name;
    const displayDuration =
      createdBooking?.duration_hours ??
      (Number(durationHours) || selectedPackage?.hours || 6);

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
              <span className="text-slate">Event &amp; date</span>
              <span className="font-medium text-midnight tabular-nums">
                {event} &bull; {displayDate}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Time, duration &amp; guests</span>
              <span className="font-medium text-midnight tabular-nums">
                {displayTime} &bull; {displayDuration} hrs &bull; {guests} guests
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Venue</span>
              <span className="font-medium text-midnight">{venue}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Package (server verified)</span>
              <span className="font-medium text-midnight tabular-nums">
                {displayPackageName} &bull; PKR {displayPrice.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Deposit (25% mock)</span>
              <span className="font-semibold tabular-nums text-midnight">
                PKR {displayDeposit.toLocaleString()}
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

          <div className="pt-2 flex items-center justify-between gap-4">
            <Link href="/client/bookings" className="inline-block">
              <Button variant="primary" size="md">
                View in my bookings &rarr;
              </Button>
            </Link>
            <Link href="/client" className="inline-block">
              <Button variant="quiet" size="md">
                Client overview
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

      {formError && (
        <div
          role="alert"
          className="mb-6 border border-alert rounded-[2px] p-4 bg-chalk flex items-center justify-between gap-4"
        >
          <p className="font-sans text-sm text-alert font-medium">
            {formError}
          </p>
          {formError.toLowerCase().includes("sign in") && (
            <Link href={`/sign-in?next=/book/${photographer.id}`}>
              <Button variant="secondary" size="sm">
                Sign in
              </Button>
            </Link>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Left Column: Form Fields */}
          <div className="space-y-6">
            {/* Grid for Event, Date, Start time, Duration, Guests, Budget */}
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
                  type="date"
                  value={parsedIso ?? date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: "" }));
                    }
                  }}
                  className={`tabular-nums ${
                    errors.date || isDateMarkedUnavailable ? "border-alert" : ""
                  }`}
                />
                {(errors.date || isDateMarkedUnavailable) && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.date ||
                      "This date is marked booked or unavailable on the photographer's calendar."}
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
                <Label htmlFor="duration-hours">Duration (hours)</Label>
                <Input
                  id="duration-hours"
                  type="number"
                  min="1"
                  max="168"
                  value={durationHours}
                  onChange={(e) => {
                    setDurationHours(e.target.value);
                    if (errors.durationHours) {
                      setErrors((prev) => ({ ...prev, durationHours: "" }));
                    }
                  }}
                  placeholder="e.g. 6"
                  className={`tabular-nums ${
                    errors.durationHours ? "border-alert" : ""
                  }`}
                />
                {errors.durationHours && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.durationHours}
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
                  className={`tabular-nums ${
                    errors.guests ? "border-alert" : ""
                  }`}
                />
                {errors.guests && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.guests}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budget-pkr" optional>
                  Target budget (PKR)
                </Label>
                <Input
                  id="budget-pkr"
                  type="number"
                  min="1"
                  step="5000"
                  value={budget}
                  onChange={(e) => {
                    setBudget(e.target.value);
                    if (errors.budget) {
                      setErrors((prev) => ({ ...prev, budget: "" }));
                    }
                  }}
                  placeholder="e.g. 120000"
                  className={`tabular-nums ${
                    errors.budget ? "border-alert" : ""
                  }`}
                />
                {errors.budget && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.budget}
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
              {errors.notes && (
                <p className="text-xs text-alert font-sans mt-1">
                  {errors.notes}
                </p>
              )}
            </div>

            {/* Package radio group */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label id="package-group-label" className="mb-0">
                  Package
                </Label>
                <span className="text-xs font-sans text-slate">
                  Price set from package on server
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
                  }${
                    pkg.editedPhotos > 0
                      ? ` • ${pkg.editedPhotos} edited`
                      : ` • ${pkg.deliveryTime}`
                  }`;

                  return (
                    <PackageRow
                      key={pkgKey}
                      name={pkg.name}
                      detail={detailLine}
                      price={pkg.price}
                      selected={isSelected}
                      onClick={() => {
                        setSelectedPackageId(pkgKey);
                        setDurationHours(String(pkg.hours));
                        setBudget(String(pkg.price));
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
                    Package price
                  </span>
                  <span className="font-sans font-medium tabular-nums text-midnight text-right text-sm">
                    PKR {previewPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 py-3">
                  <span className="text-sm font-sans text-slate">
                    Deposit (25% mock)
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

              {/* Cancellation & Reschedule Rules from BOOKING_RULES_CONFIG */}
              <div className="my-4 space-y-2">
                <p className="text-xs text-slate font-sans leading-relaxed">
                  {BOOKING_RULES_CONFIG.shortSummary}
                </p>
                <ul className="space-y-1 text-[11px] font-sans text-slate">
                  {BOOKING_RULES_CONFIG.rules.slice(0, 2).map((rule) => (
                    <li key={rule.id}>
                      <span className="font-medium text-midnight">
                        {rule.label}:
                      </span>{" "}
                      {rule.detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Single Primary Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full text-sm font-semibold"
                loading={isPending}
                disabled={isDateMarkedUnavailable}
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
