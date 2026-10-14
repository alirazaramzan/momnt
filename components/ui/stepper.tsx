import React from "react";
import { cn } from "@/lib/utils";

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: string[];
  currentStep: number; // 0-indexed
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  className,
  ...props
}: StepperProps) {
  return (
    <div
      className={cn("flex items-center gap-2 flex-wrap", className)}
      role="list"
      aria-label="Progress status path"
      {...props}
    >
      {steps.map((step, index) => {
        const isCurrent = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <div key={step} className="flex items-center gap-2">
            <span
              role="listitem"
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-sans font-medium transition-colors select-none",
                isCurrent
                  ? "bg-primary text-primary-foreground border border-primary font-semibold"
                  : isCompleted
                  ? "border border-border text-foreground bg-muted/30"
                  : "border border-border text-surface-secondary bg-transparent"
              )}
            >
              {step}
            </span>
            {index < steps.length - 1 && (
              <span
                className="text-surface-hairline text-xs font-sans select-none"
                aria-hidden="true"
              >
                &rarr;
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
