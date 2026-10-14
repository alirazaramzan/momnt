import React from "react";
import { Label, Input, type InputProps } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface FormFieldProps {
  id: string;
  label: string;
  optional?: boolean;
  helperText?: string;
  error?: string;
  children?: React.ReactNode;
  inputProps?: InputProps;
  className?: string;
}

export function FormField({
  id,
  label,
  optional = false,
  helperText,
  error,
  children,
  inputProps,
  className,
}: FormFieldProps) {
  const hasError = Boolean(error);
  const describedBy = error
    ? `${id}-error`
    : helperText
    ? `${id}-helper`
    : undefined;

  return (
    <div className={cn("space-y-1.5 w-full text-left", className)}>
      <Label htmlFor={id} optional={optional}>
        {label}
      </Label>

      {children ? (
        children
      ) : (
        <Input
          id={id}
          aria-invalid={hasError}
          aria-describedby={describedBy}
          className={hasError ? "border-alert focus-visible:outline-alert" : undefined}
          {...inputProps}
        />
      )}

      {/* Error message with actionable fix instructions */}
      {hasError ? (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs text-alert font-medium font-sans leading-tight mt-1"
        >
          {error}
        </p>
      ) : helperText ? (
        <p
          id={`${id}-helper`}
          className="text-xs text-slate font-sans leading-tight mt-1"
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
}
