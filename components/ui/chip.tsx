import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full font-sans font-medium select-none tracking-normal transition-colors shrink-0",
  {
    variants: {
      variant: {
        // Neutral: hairline border with secondary text
        neutral:
          "border border-border text-surface-secondary bg-transparent",
        // Verified: strictly verified green
        verified:
          "border border-verified text-verified bg-transparent",
        // Brass-outline: for "Under review", brass hairline with high contrast text
        "brass-outline":
          "border border-brass text-foreground bg-transparent",
        // Alert: for errors and rejected states
        alert:
          "border border-alert text-alert bg-transparent",
        // Solid verified chip (used in badges)
        "verified-solid":
          "bg-verified text-chalk",
      },
      size: {
        sm: "px-2 py-0.5 text-xs leading-[16px]",
        md: "px-2.5 py-1 text-xs leading-[18px]",
      },
    },
    defaultVariants: {
      variant: "neutral",
      size: "md",
    },
  }
);

export interface ChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof chipVariants> {
  dot?: boolean;
}

function Chip({
  className,
  variant = "neutral",
  size = "md",
  dot = false,
  children,
  ...props
}: ChipProps) {
  const dotColorClass = {
    neutral: "bg-surface-secondary",
    verified: "bg-verified",
    "brass-outline": "bg-brass",
    alert: "bg-alert",
    "verified-solid": "bg-chalk",
  }[variant || "neutral"];

  return (
    <span className={cn(chipVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn("size-1.5 rounded-full shrink-0", dotColorClass)}
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
    </span>
  );
}

export { Chip, chipVariants };
