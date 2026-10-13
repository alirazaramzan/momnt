import React from "react";
import { cn } from "@/lib/utils";

export interface GoldDotProps extends React.HTMLAttributes<HTMLSpanElement> {
  size?: number;
  className?: string;
}

export function GoldDot({
  size = 8,
  className,
  ...props
}: GoldDotProps) {
  return (
    <span
      className={cn("inline-block rounded-full bg-brass shrink-0", className)}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
      {...props}
    />
  );
}
