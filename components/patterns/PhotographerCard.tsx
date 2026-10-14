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
  ...props
}: PhotographerCardProps) {
  const formattedPrice =
    typeof startingPrice === "number"
      ? `PKR ${startingPrice.toLocaleString()}`
      : startingPrice;

  return (
    <div
      className={cn(
        "rounded-[2px] border border-border bg-card p-5 space-y-4 select-none shadow-none text-left",
        className
      )}
      {...props}
    >
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
            className="w-full"
          >
            Book this date
          </Button>
        </div>
      )}
    </div>
  );
}
