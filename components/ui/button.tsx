import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-[2px] font-sans font-medium transition-colors select-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
  {
    variants: {
      variant: {
        // Primary: solid midnight on light, solid chalk on dark. Never brass.
        primary:
          "bg-midnight text-chalk [data-surface='dark']_&:bg-chalk [data-surface='dark']_&:text-midnight hover:opacity-90 active:opacity-100",
        // Default alias for primary
        default:
          "bg-primary text-primary-foreground hover:opacity-90 active:opacity-100",
        // Secondary: 1px outline
        secondary:
          "border border-border bg-transparent text-foreground hover:bg-muted/40 active:bg-muted/60",
        // Outline alias for secondary
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted/40 active:bg-muted/60",
        // Quiet text: no border, no background until hover
        quiet:
          "bg-transparent text-foreground hover:bg-muted/30 active:bg-muted/50",
        ghost:
          "bg-transparent text-foreground hover:bg-muted/30 active:bg-muted/50",
        // Alert/destructive
        destructive:
          "bg-alert text-chalk hover:opacity-90 active:opacity-100",
        link:
          "text-foreground underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        default: "h-10 px-4 text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading = false, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {loading && (
          <Loader2
            className="size-4 animate-spin shrink-0"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
