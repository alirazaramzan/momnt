import React from "react";
import { cn } from "@/lib/utils";
import { Seal } from "./Seal";

export interface VerifiedBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "solid" | "outline";
  className?: string;
}

/**
 * VerifiedBadge: Always rendered strictly in verified green (#1E7A5C).
 * As per brand rules: Chips are fully round, seal at 14px + "Verified".
 */
export function VerifiedBadge({
  variant = "solid",
  className,
  ...props
}: VerifiedBadgeProps) {
  const isSolid = variant === "solid";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[13px] leading-[18px] font-sans font-medium select-none tracking-normal shrink-0",
        isSolid
          ? "bg-verified text-chalk"
          : "border border-verified text-verified bg-transparent",
        className
      )}
      {...props}
    >
      <Seal
        size={14}
        className={isSolid ? "text-chalk" : "text-verified"}
      />
      <span>Verified</span>
    </span>
  );
}
