import React from "react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
  className,
  ...props
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[2px] border border-border bg-card/50 p-8 text-center flex flex-col items-center justify-center space-y-3 select-none",
        className
      )}
      role="region"
      aria-label="Empty state notice"
      {...props}
    >
      {/* Exactly one line of copy telling the user what to do next. Strictly no illustrations. */}
      <p className="font-sans text-sm text-surface-secondary max-w-md leading-relaxed">
        {message}
      </p>

      {/* Exactly one quiet button */}
      {actionLabel && onAction && (
        <Button variant="quiet" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
