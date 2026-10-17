"use client";

import React from "react";
import { Avatar, Chip, Button } from "@/components/ui";
import { VerifiedBadge } from "@/components/brand";
import { cn } from "@/lib/utils";

export interface PhotographerCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  avatarSrc?: string;
  avatarFallback: string;
  verified?: boolean;
  city: string;
  specialisation: string;
  startingPrice: string | number;
  nextFreeDate?: string;
  onBook?: () => void;
  className?: string;
  compareChecked?: boolean;
  onCompareChange?: (checked: boolean) => void;
  compareDisabled?: boolean;
  photoStrip?: React.ReactNode;
}

export function PhotographerCard({
  name,
  avatarSrc,
  avatarFallback,
  verified = false,
  city,
  specialisation,
  startingPrice,
  nextFreeDate,
  onBook,
  className,
  compareChecked,
  onCompareChange,
  compareDisabled = false,
  photoStrip,
  ...props
}: PhotographerCardProps) {
  const formattedPrice =
    typeof startingPrice === "number"
      ? `PKR ${startingPrice.toLocaleString()}`
      : startingPrice;

  return (
    <div
      className={cn(
        "rounded-[2px] border border-border bg-card p-5 select-none shadow-none text-left",
        className
      )}
      {...props}
    >
      <div className={cn("flex flex-col gap-5", photoStrip && "md:flex-row md:items-stretch md:justify-between")}>
        {/* Left / Main Details */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Compare checkbox if handler provided */}
          {onCompareChange && (
            <div className="flex items-center justify-between pb-1">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none text-xs text-slate hover:text-foreground">
                <input
                  type="checkbox"
                  checked={compareChecked}
                  disabled={compareDisabled && !compareChecked}
                  onChange={(e) => onCompareChange(e.target.checked)}
                  className="size-4 rounded-[2px] border border-[#CFCFCB] accent-midnight cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight disabled:cursor-not-allowed disabled:opacity-50"
                />
                <span className="font-sans font-medium">Compare</span>
              </label>
            </div>
          )}

          {/* Top row: Avatar & Identity */}
          <div className="flex items-start gap-3.5">
            <Avatar
              src={avatarSrc}
              fallback={avatarFallback}
              size="lg"
              className="shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-display text-[24px] leading-tight text-foreground truncate">
                  {name}
                </h3>
                {/* Acceptance checklist: VerifiedBadge shows only when verified is true */}
                {verified && <VerifiedBadge variant="solid" />}
              </div>
              <p className="font-sans text-xs text-slate mt-0.5">
                {city}, {specialisation}
              </p>
            </div>
          </div>

          {/* Middle row: Price and next-free availability */}
          <div className="flex items-center justify-between pt-1 border-t border-border/50 text-xs">
            <div>
              <span className="text-slate block text-[11px]">Starting from</span>
              <span className="font-sans font-semibold text-sm tabular-nums text-foreground">
                From {formattedPrice}
              </span>
            </div>
            {nextFreeDate && (
              <Chip variant="neutral" size="sm">
                {nextFreeDate}
              </Chip>
            )}
          </div>

          {/* Action button */}
          {onBook && (
            <div className="pt-1">
              <Button
                variant="primary"
                size="md"
                onClick={onBook}
                className="w-full sm:w-auto"
              >
                Book this date
              </Button>
            </div>
          )}
        </div>

        {/* Right side: 3-photo strip if provided */}
        {photoStrip && (
          <div className="w-full md:w-[320px] shrink-0 border-t md:border-t-0 md:border-l border-border/60 pt-4 md:pt-0 md:pl-5 flex items-center">
            {photoStrip}
          </div>
        )}
      </div>
    </div>
  );
}
