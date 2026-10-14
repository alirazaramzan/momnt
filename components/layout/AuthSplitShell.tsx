import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand";
import { SkipToContent } from "./SkipToContent";

export interface AuthSplitShellProps {
  children: React.ReactNode;
}

export function AuthSplitShell({ children }: AuthSplitShellProps) {
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col lg:flex-row bg-chalk text-midnight">
      <SkipToContent targetId="auth-form-content" />

      {/* Left panel:
          - Desktop (>=1024px): 50% split screen, midnight background, chalk text, logo top-left, display promise bottom-left.
          - Mobile (<1024px): Short dark band at the top with only the wordmark.
      */}
      <aside
        data-surface="dark"
        className="w-full max-w-full lg:w-1/2 lg:min-h-screen bg-midnight text-chalk flex flex-col justify-between px-6 py-4 lg:p-16 shrink-0 border-b lg:border-b-0 lg:border-r border-[#26324A]"
      >
        {/* Top-left: Wordmark Logo */}
        <div>
          <Link
            href="/"
            aria-label="Momnt home"
            className="inline-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-chalk rounded-[2px]"
          >
            <Logo variant="dark" size="sm" className="hidden lg:block lg:text-[40px]" />
            <Logo variant="dark" size="sm" className="lg:hidden" />
          </Link>
        </div>

        {/* Bottom-left: Display line in Bodoni Moda (desktop only) */}
        <div className="hidden lg:block space-y-4 max-w-md select-none">
          <h2 className="font-display text-[36px] sm:text-[44px] leading-[1.15] font-normal text-chalk">
            Every moment, in trusted hands.
          </h2>
          <p className="font-sans text-sm text-[#9AA3B5]">
            Verified photography platform for Pakistan.
          </p>
        </div>
      </aside>

      {/* Right panel: Light surface (chalk), vertically centered form, max width 420px */}
      <main
        id="auth-form-content"
        tabIndex={-1}
        data-surface="light"
        className="w-full max-w-full min-w-0 flex-1 bg-chalk text-midnight px-6 py-8 sm:py-12 lg:py-16 flex flex-col justify-center outline-none"
      >
        <div className="w-full max-w-[420px] mx-auto space-y-6 min-w-0">
          {children}
        </div>
      </main>
    </div>
  );
}
