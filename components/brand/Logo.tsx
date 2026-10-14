import React from "react";
import { cn } from "@/lib/utils";
import { CropMarks } from "./CropMarks";

export interface LogoProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "dark" | "auto";
  withCropMarks?: boolean;
  withUrdu?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Logo({
  variant = "auto",
  withCropMarks = false,
  withUrdu = false,
  size = "md",
  className,
  ...props
}: LogoProps) {
  // Size classes: Bodoni Moda at 32px and above for display as per AGENTS.md
  const sizeClasses = {
    sm: "text-[32px] leading-none min-w-[72px]",
    md: "text-[40px] leading-none min-w-[88px]",
    lg: "text-[48px] leading-none min-w-[104px]",
    xl: "text-[64px] leading-none min-w-[140px]",
  }[size];

  // Colors: text is midnight on light, chalk on dark; full stop is ALWAYS brass.
  const textColor = {
    light: "text-midnight",
    dark: "text-chalk",
    auto: "text-surface-fg",
  }[variant];

  const content = (
    <span className={cn("inline-flex flex-col items-start select-none", className)}>
      <span
        className={cn(
          "inline-flex items-baseline font-display font-normal lowercase tracking-normal",
          sizeClasses,
          textColor,
          withCropMarks ? "px-4 py-2" : ""
        )}
      >
        <span>momnt</span>
        <span className="text-brass font-sans" aria-hidden="true">
          .
        </span>
      </span>
      {withUrdu && (
        <span
          className={cn(
            "text-[14px] leading-tight font-normal text-surface-secondary mt-1",
            withCropMarks ? "px-4" : ""
          )}
          dir="rtl"
          aria-hidden="true"
        >
          لمحہ
        </span>
      )}
    </span>
  );

  if (withCropMarks) {
    return (
      <CropMarks className="inline-block" cornerLength={26} {...props}>
        {content}
      </CropMarks>
    );
  }

  return (
    <div className="inline-block" {...props}>
      {content}
    </div>
  );
}
