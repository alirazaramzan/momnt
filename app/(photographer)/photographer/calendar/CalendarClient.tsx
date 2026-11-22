"use client";

import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/patterns";
import { Button, Card, Chip, Toast } from "@/components/ui";
import { setPhotographerAvailabilityBatch } from "@/lib/booking/actions";
import type {
  CalendarDateEntry,
  EnrichedBookingItem,
} from "@/lib/booking/queries";
import {
  bookingStatusChipVariant,
  formatBookingStatusLabel,
} from "@/lib/booking/transitions";
import {
  formatIsoDateHuman,
  type AvailabilityStatusValue,
} from "@/lib/validators/booking";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

type ToastState = {
  variant: "verified" | "alert";
  title: string;
  description?: string;
} | null;

export interface CalendarClientProps {
  initialEntries: Record<string, CalendarDateEntry>;
  upcomingBookings: EnrichedBookingItem[];
}

export function CalendarClient({
  initialEntries,
  upcomingBookings,
}: CalendarClientProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState<number>(now.getUTCFullYear());
  const [viewMonth, setViewMonth] = useState<number>(now.getUTCMonth()); // 0..11
  const [entries, setEntries] =
    useState<Record<string, CalendarDateEntry>>(initialEntries);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [conflictBanner, setConflictBanner] = useState<string>("");
  const [toast, setToast] = useState<ToastState>(null);
  const [isSaving, startSaving] = useTransition();

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const daysCount = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
  const firstDow = new Date(Date.UTC(viewYear, viewMonth, 1)).getUTCDay();
  const firstDayOffset = (firstDow + 6) % 7;

  const formatIso = (day: number) =>
    `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

  const changeMonth = (delta: number) => {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
    setSelectedDates([]);
    setConflictBanner("");
  };

  const jumpToToday = () => {
    const today = new Date();
    setViewYear(today.getUTCFullYear());
    setViewMonth(today.getUTCMonth());
  };

  const toggleDateSelection = (iso: string) => {
    setConflictBanner("");
    setSelectedDates((prev) =>
      prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]
    );
  };

  const handleApplyStatus = (targetStatus: AvailabilityStatusValue) => {
    if (selectedDates.length === 0) return;
    setConflictBanner("");

    startSaving(async () => {
      const result = await setPhotographerAvailabilityBatch({
        dates: selectedDates,
        status: targetStatus,
      });

      if (result.ok) {
        setEntries((prev) => {
          const next = { ...prev };
          for (const date of result.updatedDates) {
            const existing = next[date];
            next[date] = {
              date,
              status: result.status,
              lockedByBooking: existing?.lockedByBooking ?? false,
              bookingId: existing?.bookingId,
              bookingEvent: existing?.bookingEvent,
              bookingClientName: existing?.bookingClientName,
              bookingStatus: existing?.bookingStatus,
            };
          }
          return next;
        });

        setToast({
          variant: "verified",
          title: `Marked ${result.updatedDates.length} ${
            result.updatedDates.length === 1 ? "date" : "dates"
          } as ${result.status}`,
        });
      } else {
        setConflictBanner(result.error);
        setToast({
          variant: "alert",
          title: "Calendar conflict",
          description: result.error,
        });
      }
    });
  };

  const ymPrefix = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-`;
  let bookedInMonthCount = 0;
  let unavailableInMonthCount = 0;
  for (let d = 1; d <= daysCount; d++) {
    const iso = formatIso(d);
    const st = entries[iso]?.status ?? "available";
    if (st === "booked") bookedInMonthCount++;
    if (st === "unavailable") unavailableInMonthCount++;
  }
  const availableInMonthCount =
    daysCount - bookedInMonthCount - unavailableInMonthCount;

  const singleSelectedEntry =
    selectedDates.length === 1 ? entries[selectedDates[0]] : undefined;

  return (
    <div className="space-y-8">
      {conflictBanner && (
        <div
          role="alert"
          className="border border-alert rounded-[2px] p-4 bg-chalk flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <div className="space-y-0.5">
            <p className="font-sans text-xs font-semibold text-alert">
              Date conflict
            </p>
            <p className="font-sans text-sm text-midnight">{conflictBanner}</p>
          </div>
          <Button
            type="button"
            variant="quiet"
            size="sm"
            onClick={() => setConflictBanner("")}
          >
            Dismiss
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1.65fr_1fr] gap-8 items-start">
        {/* FullCalendar Month Grid */}
        <Card
          className="p-6 space-y-5"
          role="region"
          aria-label="FullCalendar availability manager"
        >
          {/* Calendar Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#CFCFCB]">
            <div>
              <h2 className="font-sans text-[22px] leading-[30px] font-semibold text-midnight tabular-nums">
                {MONTH_NAMES[viewMonth]} {viewYear}
              </h2>
              <p className="font-sans text-xs text-slate tabular-nums mt-0.5">
                {availableInMonthCount} available &middot; {bookedInMonthCount}{" "}
                booked &middot; {unavailableInMonthCount} unavailable
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={jumpToToday}
              >
                Today
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
              >
                <ChevronLeft className="size-4" strokeWidth={1.5} />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
              >
                <ChevronRight className="size-4" strokeWidth={1.5} />
              </Button>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-sans text-slate">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-[2px] border border-[#CFCFCB] bg-chalk inline-block" />
              Available (outlined)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-[2px] border border-verified bg-verified/15 inline-block" />
              Booked
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-[2px] border border-[#CFCFCB] bg-mist inline-block" />
              Unavailable
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-3 rounded-[2px] border border-midnight bg-midnight inline-block" />
              Selected
            </span>
          </div>

          {/* Weekday Headers */}
          <div
            className="grid grid-cols-7 gap-1.5 text-center"
            aria-hidden="true"
          >
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="font-sans text-xs font-medium text-slate py-1"
              >
                {day}
              </div>
            ))}
          </div>

          {/* FullCalendar Day Cells */}
          <div
            className="grid grid-cols-7 gap-1.5"
            role="grid"
            aria-label={`${MONTH_NAMES[viewMonth]} ${viewYear}`}
          >
            {Array.from({ length: firstDayOffset }).map((_, idx) => (
              <div
                key={`empty-${idx}`}
                className="min-h-[68px] sm:min-h-[76px]"
                aria-hidden="true"
              />
            ))}

            {Array.from({ length: daysCount }).map((_, idx) => {
              const day = idx + 1;
              const iso = formatIso(day);
              const entry = entries[iso];
              const status: AvailabilityStatusValue =
                entry?.status ?? "available";
              const isSelected = selectedDates.includes(iso);

              let cellStyle =
                "border-[#CFCFCB] bg-chalk text-midnight hover:bg-mist/40";
              if (status === "booked") {
                cellStyle = "border-verified bg-verified/10 text-midnight";
              } else if (status === "unavailable") {
                cellStyle = "border-[#CFCFCB] bg-mist text-slate";
              }
              if (isSelected) {
                cellStyle =
                  "border-midnight bg-midnight text-chalk ring-1 ring-midnight";
              }

              const statusLabel =
                status === "booked"
                  ? entry?.bookingEvent
                    ? `Booked (${entry.bookingEvent})`
                    : "Booked"
                  : status === "unavailable"
                  ? "Unavailable"
                  : "Available";

              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  aria-selected={isSelected}
                  aria-label={`${day} ${MONTH_NAMES[viewMonth]} ${viewYear}, ${statusLabel}`}
                  onClick={() => toggleDateSelection(iso)}
                  className={`min-h-[68px] sm:min-h-[76px] p-2 rounded-[2px] border text-left flex flex-col justify-between transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight ${cellStyle}`}
                >
                  <div className="flex items-center justify-between gap-1 w-full">
                    <span className="font-sans text-xs font-semibold tabular-nums">
                      {day}
                    </span>
                    {entry?.lockedByBooking && (
                      <span
                        className={`size-1.5 rounded-full ${
                          isSelected ? "bg-chalk" : "bg-verified"
                        }`}
                        title="Confirmed booking"
                      />
                    )}
                  </div>

                  <div className="w-full truncate">
                    {status === "booked" ? (
                      <span
                        className={`block font-sans text-[11px] leading-tight truncate ${
                          isSelected
                            ? "text-chalk font-medium"
                            : "text-verified font-medium"
                        }`}
                      >
                        {entry?.bookingEvent ?? "Booked"}
                      </span>
                    ) : status === "unavailable" ? (
                      <span
                        className={`block font-sans text-[11px] leading-tight truncate ${
                          isSelected ? "text-chalk/80" : "text-slate"
                        }`}
                      >
                        Unavailable
                      </span>
                    ) : (
                      <span
                        className={`block font-sans text-[11px] leading-tight truncate ${
                          isSelected ? "text-chalk/80" : "text-slate/70"
                        }`}
                      >
                        Free
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Selected Dates Action Panel & Confirmed Bookings */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-sans text-base font-semibold text-midnight">
                {selectedDates.length === 0
                  ? "Select dates to update"
                  : selectedDates.length === 1
                  ? formatIsoDateHuman(selectedDates[0], "long")
                  : `${selectedDates.length} dates selected`}
              </h3>
              {selectedDates.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDates([]);
                    setConflictBanner("");
                  }}
                  className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4"
                >
                  Clear
                </button>
              )}
            </div>

            {selectedDates.length === 0 ? (
              <p className="font-sans text-xs text-slate leading-relaxed">
                Click one or more days on the calendar to mark them as
                available, booked, or unavailable. Changes update your public
                profile and search results immediately.
              </p>
            ) : (
              <div className="space-y-4">
                {singleSelectedEntry?.lockedByBooking && (
                  <div className="border border-[#CFCFCB] p-3.5 rounded-[2px] space-y-1.5 bg-chalk">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-sans text-xs font-semibold text-midnight">
                        {singleSelectedEntry.bookingEvent} &middot;{" "}
                        {singleSelectedEntry.bookingClientName}
                      </span>
                      {singleSelectedEntry.bookingStatus && (
                        <Chip
                          variant={bookingStatusChipVariant(
                            singleSelectedEntry.bookingStatus
                          )}
                          size="sm"
                        >
                          {formatBookingStatusLabel(
                            singleSelectedEntry.bookingStatus
                          )}
                        </Chip>
                      )}
                    </div>
                    <p className="font-sans text-xs text-slate">
                      Locked by an accepted booking. To free this date, cancel
                      the booking from your projects page.
                    </p>
                  </div>
                )}

                <div className="space-y-2">
                  <p className="font-sans text-xs font-medium text-slate">
                    Set status for selected{" "}
                    {selectedDates.length === 1 ? "date" : "dates"}
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      loading={isSaving}
                      onClick={() => handleApplyStatus("available")}
                      className="w-full justify-center"
                    >
                      Mark available
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={isSaving}
                      onClick={() => handleApplyStatus("unavailable")}
                      className="w-full justify-center"
                    >
                      Mark unavailable
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      disabled={isSaving}
                      onClick={() => handleApplyStatus("booked")}
                      className="w-full justify-center"
                    >
                      Mark booked (external shoot)
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Upcoming Confirmed Bookings on Calendar */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-base font-semibold text-midnight">
                Booked shoots
              </h3>
              <Link
                href="/photographer/projects"
                className="font-sans text-xs text-slate hover:text-midnight underline underline-offset-4"
              >
                All projects
              </Link>
            </div>

            {upcomingBookings.filter((b) =>
              b.eventDate.startsWith(ymPrefix)
            ).length === 0 ? (
              <EmptyState
                message={`No confirmed bookings in ${MONTH_NAMES[viewMonth]} ${viewYear}.`}
              />
            ) : (
              <div className="divide-y divide-[#CFCFCB]" role="list">
                {upcomingBookings
                  .filter((b) => b.eventDate.startsWith(ymPrefix))
                  .map((bk) => (
                    <div
                      key={bk.id}
                      role="listitem"
                      className="py-3 flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 min-w-0">
                        <p className="font-sans text-sm font-medium text-midnight truncate">
                          {bk.eventType} &middot; {bk.clientName}
                        </p>
                        <p className="font-sans text-xs text-slate tabular-nums">
                          {bk.eventDateShort} &middot; {bk.location}
                        </p>
                      </div>
                      <Chip
                        variant={bookingStatusChipVariant(bk.status)}
                        size="sm"
                      >
                        {formatBookingStatusLabel(bk.status)}
                      </Chip>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Toast region */}
      <div
        className="fixed bottom-20 md:bottom-6 right-6 left-6 sm:left-auto z-50 flex justify-end"
        aria-live="polite"
      >
        {toast && (
          <Toast
            variant={toast.variant}
            title={toast.title}
            description={toast.description}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}

