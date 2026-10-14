import React from "react";
import { PhotoPlaceholder, type PhotoTone, GoldDot } from "@/components/brand";
import { cn } from "@/lib/utils";

export interface PhotoGridItem {
  id: string | number;
  number: string | number;
  tone?: PhotoTone;
  event?: string;
  aperture?: string;
  credit?: string;
  aspect?: string;
}

export interface PhotoGridProps {
  items: PhotoGridItem[];
  favourites?: (string | number)[];
  onToggle?: (id: string | number) => void;
  className?: string;
}

export function PhotoGrid({
  items,
  favourites = [],
  onToggle,
  className,
}: PhotoGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3",
        className
      )}
      role="region"
      aria-label="Photo grid"
    >
      {items.map((item) => {
        const isFav = favourites.includes(item.id);
        const formattedNum =
          typeof item.number === "number"
            ? String(item.number).padStart(3, "0")
            : item.number;

        return (
          <div
            key={item.id}
            className="group relative cursor-pointer outline-none rounded-[2px]"
            onClick={() => onToggle?.(item.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onToggle?.(item.id);
              }
            }}
            aria-label={`Frame ${formattedNum}${isFav ? ", marked favourite" : ""}. Press space or enter to toggle favourite.`}
          >
            {/* Base placeholder with corner marks and bottom-left number */}
            <PhotoPlaceholder
              tone={item.tone || "midnight"}
              aspect={item.aspect || "4/3"}
              credit={item.credit}
              caption={
                item.event && item.aperture
                  ? { number: formattedNum, event: item.event, aperture: item.aperture }
                  : formattedNum
              }
              withCorners={false}
              className="w-full transition-opacity group-hover:opacity-95"
            />

            {/* Top-Right Favourite GoldDot */}
            {isFav && (
              <div
                className="absolute top-2.5 right-2.5 z-20 flex items-center justify-center p-1"
                aria-hidden="true"
              >
                <GoldDot size={10} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
