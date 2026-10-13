import React from "react";
import { cn } from "@/lib/utils";
import { CameraCaption } from "./CameraCaption";

export type PhotoTone = "warm" | "midnight" | "slate" | "dune";

export interface CaptionData {
  number: string | number;
  event: string;
  aperture: string;
}

export interface PhotoPlaceholderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tone?: PhotoTone;
  caption?: string | CaptionData;
  aspect?: "1/1" | "4/3" | "3/2" | "16/9" | "2/3" | string;
  credit?: string;
  className?: string;
  withCorners?: boolean;
}

const toneGradients: Record<PhotoTone, string> = {
  // All gradient color stops strictly use the defined brand tokens
  warm: "bg-gradient-to-br from-[#F1F0EC] via-[#E3E5E8] to-[#C2A267]",
  midnight: "bg-gradient-to-br from-[#0A1428] via-[#26324A] to-[#0A1428]",
  slate: "bg-gradient-to-br from-[#5B6578] via-[#26324A] to-[#0A1428]",
  dune: "bg-gradient-to-br from-[#C2A267] via-[#E3E5E8] to-[#F1F0EC]",
};

export function PhotoPlaceholder({
  tone = "warm",
  caption,
  aspect = "3/2",
  credit,
  className,
  withCorners = true,
  ...props
}: PhotoPlaceholderProps) {
  // Determine if tone is dark for caption text contrast
  const isDarkTone = tone === "midnight" || tone === "slate";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2px] border border-border flex flex-col justify-between p-3 select-none",
        toneGradients[tone],
        className
      )}
      style={{ aspectRatio: aspect }}
      {...props}
    >
      {/* Optional decorative brass crop corners (corners only) */}
      {withCorners && (
        <>
          <div
            className="pointer-events-none absolute top-2 left-2 bg-brass"
            style={{ width: "16px", height: "1px" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-2 left-2 bg-brass"
            style={{ width: "1px", height: "16px" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-2 right-2 bg-brass"
            style={{ width: "16px", height: "1px" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute top-2 right-2 bg-brass"
            style={{ width: "1px", height: "16px" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-2 left-2 bg-brass"
            style={{ width: "16px", height: "1px" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-2 left-2 bg-brass"
            style={{ width: "1px", height: "16px" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-2 right-2 bg-brass"
            style={{ width: "16px", height: "1px" }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute bottom-2 right-2 bg-brass"
            style={{ width: "1px", height: "16px" }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Top row: Photographer credit if provided */}
      <div className="relative z-10 flex items-center justify-between text-[11px] leading-tight">
        {credit ? (
          <span
            className={cn(
              "font-sans font-medium",
              isDarkTone ? "text-dark-secondary" : "text-slate"
            )}
          >
            {credit}
          </span>
        ) : <span />}
      </div>

      {/* Bottom row: Camera caption */}
      <div className="relative z-10 flex items-end justify-between">
        {caption && (
          <div
            className={cn(
              "rounded-[2px] px-2 py-1 backdrop-blur-xs",
              isDarkTone
                ? "bg-midnight/80 text-dark-secondary"
                : "bg-chalk/80 text-slate"
            )}
          >
            {typeof caption === "string" ? (
              <span className="font-sans text-[13px] leading-[18px] tabular-nums">
                {caption}
              </span>
            ) : (
              <CameraCaption
                number={caption.number}
                event={caption.event}
                aperture={caption.aperture}
                className={isDarkTone ? "text-dark-secondary" : "text-slate"}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
