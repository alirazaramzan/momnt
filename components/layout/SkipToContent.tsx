import React from "react";

export function SkipToContent({
  targetId = "main-content",
}: {
  targetId?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-midnight focus:text-chalk focus:outline-2 focus:outline-offset-2 focus:outline-midnight rounded-[2px] font-sans text-sm font-medium transition-all"
    >
      Skip to content
    </a>
  );
}
