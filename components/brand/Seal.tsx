import React from "react";
import { cn } from "@/lib/utils";

export interface SealProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
  className?: string;
  dotColor?: string;
}

export function Seal({
  size = 24,
  className,
  dotColor = "#C2A267",
  ...props
}: SealProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="Momnt focus seal"
      {...props}
    >
      {/* Top-Left Corner */}
      <path
        d="M2 7V2H7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      {/* Top-Right Corner */}
      <path
        d="M17 2H22V7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      {/* Bottom-Left Corner */}
      <path
        d="M2 17V22H7"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      {/* Bottom-Right Corner */}
      <path
        d="M17 22H22V17"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="square"
        vectorEffect="non-scaling-stroke"
      />
      {/* Center Gold Dot */}
      <circle cx="12" cy="12" r="2.2" fill={dotColor} />
    </svg>
  );
}
