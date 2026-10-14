import React from "react";
import { cn } from "@/lib/utils";

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  optional?: boolean;
}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, children, optional, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "block text-xs font-medium font-sans text-surface-secondary select-none mb-1.5",
          className
        )}
        {...props}
      >
        {children}
        {optional && (
          <span className="ml-1 text-slate font-normal">(optional)</span>
        )}
      </label>
    );
  }
);
Label.displayName = "Label";

export { Label };
