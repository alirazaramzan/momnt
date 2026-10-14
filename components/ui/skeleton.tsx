import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-[2px] bg-mist dark:bg-muted select-none",
        className
      )}
      aria-hidden="true"
      {...props}
    />
  );
}
