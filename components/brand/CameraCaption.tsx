import React from "react";
import { cn } from "@/lib/utils";

export interface CameraCaptionProps extends React.HTMLAttributes<HTMLSpanElement> {
  number: string | number;
  event: string;
  aperture: string;
  className?: string;
}

export function CameraCaption({
  number,
  event,
  aperture,
  className,
  ...props
}: CameraCaptionProps) {
  const formattedNumber =
    typeof number === "number"
      ? String(number).padStart(3, "0")
      : number;

  return (
    <span
      className={cn(
        "font-sans text-[13px] leading-[18px] tabular-nums tracking-normal text-surface-secondary",
        className
      )}
      {...props}
    >
      No. {formattedNumber}, {event}, {aperture}
    </span>
  );
}
