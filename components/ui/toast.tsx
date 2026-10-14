import React from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "verified" | "alert";
  title?: string;
  description?: string;
  onClose?: () => void;
}

export function Toast({
  variant = "default",
  title,
  description,
  onClose,
  className,
  children,
  ...props
}: ToastProps) {
  const variantStyles = {
    default: "border-border bg-card text-card-foreground",
    verified: "border-verified bg-card text-card-foreground",
    alert: "border-alert bg-card text-card-foreground",
  }[variant];

  return (
    <div
      role="status"
      className={cn(
        "flex w-full max-w-sm items-start gap-3 rounded-[2px] border p-4 shadow-menu select-none animate-in fade-in slide-in-from-bottom-2 duration-200",
        variantStyles,
        className
      )}
      {...props}
    >
      {variant === "verified" && (
        <CheckCircle2 className="size-4 text-verified shrink-0 mt-0.5" strokeWidth={1.5} />
      )}
      {variant === "alert" && (
        <AlertCircle className="size-4 text-alert shrink-0 mt-0.5" strokeWidth={1.5} />
      )}

      <div className="flex-1 space-y-1">
        {title && (
          <h4 className="font-sans text-sm font-semibold leading-tight text-foreground">
            {title}
          </h4>
        )}
        {description && (
          <p className="font-sans text-xs text-surface-secondary leading-normal">
            {description}
          </p>
        )}
        {children}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="rounded-[2px] p-1 text-surface-secondary hover:text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground shrink-0 -mr-1 -mt-1"
          aria-label="Close notification"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      )}
    </div>
  );
}
