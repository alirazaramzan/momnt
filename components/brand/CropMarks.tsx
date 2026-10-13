import React from "react";
import { cn } from "@/lib/utils";

export interface CropMarksProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
  cornerLength?: number;
}

export function CropMarks({
  children,
  className,
  cornerLength = 26,
  ...props
}: CropMarksProps) {
  const lineStyle = `${cornerLength}px`;

  return (
    <div
      className={cn("relative inline-block", className)}
      {...props}
    >
      {/* Top-Left Corner */}
      <div
        className="pointer-events-none absolute top-0 left-0 bg-brass"
        style={{ width: lineStyle, height: "1px" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 left-0 bg-brass"
        style={{ width: "1px", height: lineStyle }}
        aria-hidden="true"
      />

      {/* Top-Right Corner */}
      <div
        className="pointer-events-none absolute top-0 right-0 bg-brass"
        style={{ width: lineStyle, height: "1px" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-0 right-0 bg-brass"
        style={{ width: "1px", height: lineStyle }}
        aria-hidden="true"
      />

      {/* Bottom-Left Corner */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 bg-brass"
        style={{ width: lineStyle, height: "1px" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 bg-brass"
        style={{ width: "1px", height: lineStyle }}
        aria-hidden="true"
      />

      {/* Bottom-Right Corner */}
      <div
        className="pointer-events-none absolute bottom-0 right-0 bg-brass"
        style={{ width: lineStyle, height: "1px" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 bg-brass"
        style={{ width: "1px", height: lineStyle }}
        aria-hidden="true"
      />

      {/* Children content */}
      {children}
    </div>
  );
}
