"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { Button, Input, Select, Label } from "@/components/ui";

const EVENT_TYPES = [
  "Brand shoot",
  "Mehndi",
  "Full wedding",
  "Portrait session",
  "Nikah",
  "Corporate event",
];

const CITIES = ["Lahore", "Karachi", "Islamabad", "Rawalpindi"];

const BUDGET_GUIDE_DATA: Record<
  string,
  Record<string, { from: number; to: number }>
> = {
  "Brand shoot": {
    Lahore: { from: 75000, to: 160000 },
    Karachi: { from: 80000, to: 180000 },
    Islamabad: { from: 70000, to: 150000 },
    Rawalpindi: { from: 65000, to: 140000 },
  },
  Mehndi: {
    Karachi: { from: 100000, to: 250000 },
    Lahore: { from: 90000, to: 220000 },
    Islamabad: { from: 85000, to: 210000 },
    Rawalpindi: { from: 80000, to: 200000 },
  },
  "Full wedding": {
    Karachi: { from: 180000, to: 240000 },
    Lahore: { from: 160000, to: 210000 },
    Islamabad: { from: 150000, to: 200000 },
    Rawalpindi: { from: 140000, to: 190000 },
  },
  "Portrait session": {
    Lahore: { from: 35000, to: 60000 },
    Karachi: { from: 45000, to: 70000 },
    Islamabad: { from: 40000, to: 65000 },
    Rawalpindi: { from: 35000, to: 60000 },
  },
  Nikah: {
    Lahore: { from: 70000, to: 120000 },
    Karachi: { from: 80000, to: 130000 },
    Islamabad: { from: 70000, to: 115000 },
    Rawalpindi: { from: 65000, to: 110000 },
  },
  "Corporate event": {
    Lahore: { from: 50000, to: 110000 },
    Karachi: { from: 60000, to: 120000 },
    Islamabad: { from: 55000, to: 110000 },
    Rawalpindi: { from: 50000, to: 100000 },
  },
};

export function GigPostingClient() {
  // Form fields
  const [title, setTitle] = useState("Brand shoot for a new cafe");
  const [eventType, setEventType] = useState("Brand shoot");
  const [city, setCity] = useState("Lahore");
  const [date, setDate] = useState("2026-11-21");
  const [hours, setHours] = useState("4");
  const [budgetFrom, setBudgetFrom] = useState("75000");
  const [budgetTo, setBudgetTo] = useState("160000");
  const [bidDeadline, setBidDeadline] = useState("2026-11-18");
  const [files, setFiles] = useState<{ name: string; size: number }[]>([
    { name: "moodboard-warm-tones.jpg", size: 1420000 },
  ]);

  // States
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic budget guide lookup
  const budgetGuide =
    BUDGET_GUIDE_DATA[eventType]?.[city] ||
    BUDGET_GUIDE_DATA["Brand shoot"]["Lahore"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map((f) => ({
        name: f.name,
        size: f.size,
      }));
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};

    if (!title.trim()) {
      nextErrors.title = "Enter a title for your gig.";
    }
    if (!eventType) {
      nextErrors.eventType = "Select an event type.";
    }
    if (!city) {
      nextErrors.city = "Select a city.";
    }
    if (!date) {
      nextErrors.date = "Select an event date.";
    }
    if (!hours || Number(hours) < 1) {
      nextErrors.hours = "Enter estimated shoot hours.";
    }
    if (!budgetFrom || Number(budgetFrom) <= 0) {
      nextErrors.budgetFrom = "Enter a starting budget.";
    }
    if (!budgetTo || Number(budgetTo) <= 0) {
      nextErrors.budgetTo = "Enter a maximum budget.";
    }

    // Validation: budget from must be below budget to
    if (
      budgetFrom &&
      budgetTo &&
      Number(budgetFrom) >= Number(budgetTo)
    ) {
      nextErrors.budgetTo = "Budget from must be below budget to.";
    }

    if (!bidDeadline) {
      nextErrors.bidDeadline = "Select a deadline for bids.";
    }

    // Validation: deadline must be before the event date
    if (date && bidDeadline) {
      const eventDateObj = new Date(date);
      const deadlineDateObj = new Date(bidDeadline);
      if (deadlineDateObj >= eventDateObj) {
        nextErrors.bidDeadline = "Bid deadline must be before the event date.";
      }
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
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setTitle("");
    setEventType("Brand shoot");
    setCity("Lahore");
    setDate("");
    setHours("4");
    setBudgetFrom("");
    setBudgetTo("");
    setBidDeadline("");
    setFiles([]);
    setErrors({});
    setIsSubmitted(false);
  };

  // Success Confirmation View
  if (isSubmitted) {
    return (
      <div className="max-w-[640px] mx-auto px-6 py-12 md:py-16">
        <div className="border border-[#CFCFCB] bg-chalk p-8 rounded-[2px] space-y-6">
          <div className="space-y-2">
            <p className="font-sans text-xs text-slate">Gig marketplace</p>
            <h1 className="font-serif text-[32px] md:text-[36px] text-midnight leading-tight">
              Gig posted
            </h1>
            <p className="font-sans text-base text-slate leading-relaxed">
              Your gig is live for verified photographers in {city}. You will
              receive notifications as bids arrive.
            </p>
          </div>

          <div className="border-t border-b border-[#CFCFCB] py-5 space-y-3">
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Title</span>
              <span className="font-medium text-midnight truncate max-w-[280px]">
                {title}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Event & city</span>
              <span className="font-medium text-midnight">
                {eventType} &bull; {city}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Date & hours</span>
              <span className="font-medium text-midnight tabular-nums">
                {date} &bull; {hours} hours
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Budget range</span>
              <span className="font-semibold tabular-nums text-midnight">
                PKR {Number(budgetFrom).toLocaleString()} &ndash;{" "}
                {Number(budgetTo).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-sans">
              <span className="text-slate">Bid deadline</span>
              <span className="font-medium text-midnight tabular-nums">
                {bidDeadline}
              </span>
            </div>
            {files.length > 0 && (
              <div className="flex items-center justify-between text-sm font-sans">
                <span className="text-slate">Reference frames</span>
                <span className="text-slate tabular-nums">
                  {files.length} {files.length === 1 ? "image" : "images"} attached
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link href="/gigs" tabIndex={-1}>
              <Button variant="primary" size="md">
                Browse marketplace
              </Button>
            </Link>
            <Button variant="quiet" size="md" onClick={handleReset}>
              Post another gig
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1120px] mx-auto px-6 py-8 md:py-12">
      {/* Top context header */}
      <div className="mb-8">
        <Link
          href="/gigs"
          className="font-sans text-xs text-slate hover:text-midnight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px] transition-colors mb-2 inline-block"
        >
          &larr; Back to gigs
        </Link>
        <h1 className="font-serif text-[32px] md:text-[36px] text-midnight leading-tight">
          Post a gig
        </h1>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8 lg:gap-12 items-start">
          {/* Left Column: Form Fields */}
          <div className="space-y-5">
            {/* Title field */}
            <div>
              <Label htmlFor="gig-title">Title</Label>
              <Input
                id="gig-title"
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => ({ ...prev, title: "" }));
                  }
                }}
                placeholder="Brand shoot for a new cafe"
                className={errors.title ? "border-alert" : ""}
              />
              {errors.title && (
                <p className="text-xs text-alert font-sans mt-1">
                  {errors.title}
                </p>
              )}
            </div>

            {/* Two-column grid of Event type, City, Date, Hours, Budget from, Budget to */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="event-type">Event type</Label>
                <Select
                  id="event-type"
                  value={eventType}
                  onChange={(e) => {
                    setEventType(e.target.value);
                    if (errors.eventType) {
                      setErrors((prev) => ({ ...prev, eventType: "" }));
                    }
                  }}
                  className={errors.eventType ? "border-alert" : ""}
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                {errors.eventType && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.eventType}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="gig-city">City</Label>
                <Select
                  id="gig-city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    if (errors.city) {
                      setErrors((prev) => ({ ...prev, city: "" }));
                    }
                  }}
                  className={errors.city ? "border-alert" : ""}
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
                {errors.city && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.city}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="event-date">Date</Label>
                <Input
                  id="event-date"
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    if (errors.date) {
                      setErrors((prev) => ({ ...prev, date: "" }));
                    }
                  }}
                  className={errors.date ? "border-alert" : ""}
                />
                {errors.date && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.date}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="gig-hours">Hours</Label>
                <Input
                  id="gig-hours"
                  type="number"
                  min="1"
                  max="24"
                  value={hours}
                  onChange={(e) => {
                    setHours(e.target.value);
                    if (errors.hours) {
                      setErrors((prev) => ({ ...prev, hours: "" }));
                    }
                  }}
                  placeholder="4"
                  className={errors.hours ? "border-alert" : ""}
                />
                {errors.hours && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.hours}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budget-from">Budget from (PKR)</Label>
                <Input
                  id="budget-from"
                  type="number"
                  step="1000"
                  value={budgetFrom}
                  onChange={(e) => {
                    setBudgetFrom(e.target.value);
                    if (errors.budgetFrom || errors.budgetTo) {
                      setErrors((prev) => ({
                        ...prev,
                        budgetFrom: "",
                        budgetTo: "",
                      }));
                    }
                  }}
                  placeholder="75000"
                  className={errors.budgetFrom ? "border-alert" : ""}
                />
                {errors.budgetFrom && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.budgetFrom}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="budget-to">Budget to (PKR)</Label>
                <Input
                  id="budget-to"
                  type="number"
                  step="1000"
                  value={budgetTo}
                  onChange={(e) => {
                    setBudgetTo(e.target.value);
                    if (errors.budgetTo) {
                      setErrors((prev) => ({ ...prev, budgetTo: "" }));
                    }
                  }}
                  placeholder="160000"
                  className={errors.budgetTo ? "border-alert" : ""}
                />
                {errors.budgetTo && (
                  <p className="text-xs text-alert font-sans mt-1">
                    {errors.budgetTo}
                  </p>
                )}
              </div>
            </div>

            {/* Bid deadline */}
            <div>
              <Label htmlFor="bid-deadline">Bid deadline</Label>
              <Input
                id="bid-deadline"
                type="date"
                value={bidDeadline}
                onChange={(e) => {
                  setBidDeadline(e.target.value);
                  if (errors.bidDeadline) {
                    setErrors((prev) => ({ ...prev, bidDeadline: "" }));
                  }
                }}
                className={errors.bidDeadline ? "border-alert" : ""}
              />
              {errors.bidDeadline && (
                <p className="text-xs text-alert font-sans mt-1">
                  {errors.bidDeadline}
                </p>
              )}
            </div>

            {/* Reference images - accessible dashed upload area */}
            <div>
              <Label htmlFor="reference-images-input" optional>
                Reference images
              </Label>
              <div
                role="button"
                tabIndex={0}
                aria-label="Upload reference images"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    fileInputRef.current?.click();
                  }
                }}
                className="border border-dashed border-[#CFCFCB] hover:border-midnight/40 rounded-[2px] p-6 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight bg-mist/10"
              >
                <input
                  id="reference-images-input"
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                  tabIndex={-1}
                />
                <p className="font-sans text-sm font-medium text-midnight">
                  Click or press Enter to choose reference images
                </p>
                <p className="font-sans text-xs text-slate mt-1">
                  Attach moodboards, venue snapshots, or lighting guides (up to
                  15MB)
                </p>

                {files.length > 0 && (
                  <div
                    className="mt-4 flex flex-wrap gap-2 justify-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {files.map((file, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans bg-mist/50 text-midnight border border-[#CFCFCB]"
                      >
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          aria-label={`Remove ${file.name}`}
                          className="text-slate hover:text-alert font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px] px-0.5"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Primary Submit Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full sm:w-auto"
              >
                Post gig
              </Button>
            </div>
          </div>

          {/* Right Column: Sticky Budget Guide */}
          <div className="lg:sticky lg:top-24 self-start">
            <div className="border-t border-[#C2A267] pt-4 space-y-2">
              <h2 className="font-sans text-base font-semibold text-midnight">
                Budget guide
              </h2>
              <p className="font-sans text-sm text-slate">
                Typical packages for {eventType.toLowerCase()} in {city}
              </p>
              <div className="font-serif text-[26px] md:text-[32px] leading-tight text-midnight tabular-nums py-1">
                PKR {budgetGuide.from.toLocaleString()} &ndash;{" "}
                {budgetGuide.to.toLocaleString()}
              </div>
              <p className="font-sans text-xs text-slate leading-relaxed">
                Based on photographer packages on Momnt. Only verified
                photographers can bid.
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
