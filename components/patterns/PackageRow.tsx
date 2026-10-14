import React from "react";
import { cn } from "@/lib/utils";

export interface PackageRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  detail: string;
  price: string | number;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PackageRow({
  name,
  detail,
  price,
  selected = false,
  onClick,
  className,
  ...props
}: PackageRowProps) {
  const isInteractive = Boolean(onClick);

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onClick={onClick}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick?.();
        }
      }}
      className={cn(
        "flex items-center justify-between gap-4 p-3.5 transition-colors text-left",
        selected
          ? "border border-primary border-l-[3px] border-l-brass rounded-[2px] bg-muted/20"
          : "border-b border-border bg-transparent hover:bg-muted/10",
        isInteractive && "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground",
        className
      )}
      {...props}
    >
      <div className="space-y-0.5">
        <div className="font-sans text-sm font-medium text-foreground">
          {name}
        </div>
        <div className="font-sans text-xs text-slate">
          {detail}
        </div>
      </div>
      <div className="font-sans text-sm font-semibold tabular-nums text-foreground shrink-0 text-right">
        {typeof price === "number" ? `PKR ${price.toLocaleString()}` : price}
      </div>
    </div>
  );
}
