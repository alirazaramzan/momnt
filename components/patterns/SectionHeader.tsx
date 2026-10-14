import React from "react";
import { cn } from "@/lib/utils";

export interface SectionHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  lede?: string;
  action?: React.ReactNode;
  withBrassHairline?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  lede,
  action,
  withBrassHairline = false,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div className={cn("space-y-4 w-full select-none text-left", className)} {...props}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-2xl">
          <h2 className="font-display text-[28px] sm:text-[32px] font-normal leading-tight text-foreground">
            {title}
          </h2>
          {lede && (
            <p className="font-sans text-sm sm:text-base text-slate leading-relaxed">
              {lede}
            </p>
          )}
        </div>
        {action && (
          <div className="shrink-0 flex items-center">
            {action}
          </div>
        )}
      </div>

      {withBrassHairline && (
        <div
          className="h-[1px] w-full bg-brass"
          role="separator"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
