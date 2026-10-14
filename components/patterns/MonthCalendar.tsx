"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface MonthCalendarProps {
  month: string;
  year?: number;
  daysCount?: number;
  firstDayOffset?: number; // 0 for Mon, 1 for Tue, etc.
  bookedDates?: number[];
  selectedDate?: number | null;
  onSelect?: (date: number) => void;
  className?: string;
}

export function MonthCalendar({
  month,
  year = 2026,
  daysCount = 31,
  firstDayOffset = 1,
  bookedDates = [],
  selectedDate = null,
  onSelect,
  className,
}: MonthCalendarProps) {
  const weekdays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

  return (
    <div
      className={cn("w-full max-w-[280px] select-none font-sans", className)}
      role="group"
      aria-label={`${month} ${year} Calendar`}
    >
      {/* Month Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-border">
        <span className="text-sm font-semibold text-foreground">
          {month} {year}
        </span>
        <span className="text-[11px] text-slate font-medium">
          Outlined free, grey booked
        </span>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1.5" aria-hidden="true">
        {weekdays.map((day) => (
          <span key={day} className="text-[11px] font-medium text-slate">
            {day}
          </span>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1" role="grid" aria-readonly="true">
        {/* Empty cells for first day offset */}
        {Array.from({ length: firstDayOffset }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square" aria-hidden="true" />
        ))}

        {/* Days */}
        {Array.from({ length: daysCount }).map((_, i) => {
          const date = i + 1;
          const isBooked = bookedDates.includes(date);
          const isSelected = selectedDate === date;

          let accessibilityLabel = `${date} ${month} ${year}, available`;
          if (isBooked) accessibilityLabel = `${date} ${month} ${year}, booked`;
          if (isSelected) accessibilityLabel = `${date} ${month} ${year}, selected`;

          return (
            <button
              key={date}
              type="button"
              disabled={isBooked}
              onClick={() => !isBooked && onSelect?.(date)}
              aria-label={accessibilityLabel}
              aria-selected={isSelected}
              className={cn(
                "aspect-square rounded-[2px] text-xs tabular-nums flex items-center justify-center transition-colors outline-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
                isSelected
                  ? "bg-primary text-primary-foreground border border-primary font-semibold"
                  : isBooked
                  ? "bg-mist dark:bg-muted text-slate border border-transparent cursor-not-allowed opacity-80"
                  : "border border-border text-foreground hover:bg-muted/40 cursor-pointer"
              )}
            >
              {date}
            </button>
          );
        })}
      </div>
    </div>
  );
}
