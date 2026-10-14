"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui";
import { SkipToContent } from "./SkipToContent";
import { cn } from "@/lib/utils";
import { MoreHorizontal, X } from "lucide-react";

export interface PortalNavItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface PortalLayoutProps {
  portalName: string;
  portalPrefix: string;
  navItems: PortalNavItem[];
  children: React.ReactNode;
}

export function PortalLayout({
  portalName,
  portalPrefix,
  navItems,
  children,
}: PortalLayoutProps) {
  const pathname = usePathname();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  // For mobile bottom bar of 5 items:
  // If navItems > 5, display first 4 items + "More" toggle for the remaining items.
  const hasMore = navItems.length > 5;
  const bottomBarItems = hasMore ? navItems.slice(0, 4) : navItems.slice(0, 5);
  const overflowItems = hasMore ? navItems.slice(4) : [];

  const isOverflowActive = overflowItems.some(
    (item) => pathname === item.href || pathname.startsWith(item.href + "/")
  );

  return (
    <div className="min-h-screen flex flex-col bg-chalk text-midnight">
      {/* Skip to main content for keyboard users */}
      <SkipToContent targetId="portal-main-content" />

      {/* Top bar like public with portal name in slate */}
      <header className="w-full bg-chalk border-b border-[#CFCFCB] sticky top-0 z-30">
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between">
          {/* Left: Logo and portal name in slate */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              aria-label="Momnt home"
              className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
            >
              <Logo size="sm" />
            </Link>
            <span
              className="font-sans text-sm text-slate border-l border-[#CFCFCB] pl-3 py-0.5 select-none"
              aria-label={`${portalName} portal`}
            >
              {portalName}
            </span>
          </div>

          {/* Right: Switcher or quiet action */}
          <div className="flex items-center gap-2">
            <Link href="/" tabIndex={-1} className="hidden sm:inline-flex">
              <Button
                variant="quiet"
                size="sm"
                className="font-sans text-xs text-slate hover:text-midnight"
              >
                Public site
              </Button>
            </Link>
            <Link href="/sign-in" tabIndex={-1}>
              <Button
                variant="quiet"
                size="sm"
                className="font-sans text-xs text-midnight font-medium"
              >
                Sign out
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Shell body with desktop sidebar and main content */}
      <div className="flex-1 flex max-w-[1280px] w-full mx-auto">
        {/* Desktop sidebar: hairline right edge, active link with 2px brass bar */}
        <aside
          aria-label={`${portalName} sidebar navigation`}
          className="hidden md:flex flex-col w-56 lg:w-64 border-r border-[#CFCFCB] shrink-0 py-6 pr-4 space-y-1"
        >
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== portalPrefix && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center px-4 py-2.5 text-sm font-sans transition-colors rounded-[2px]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight",
                  isActive
                    ? "font-semibold text-midnight bg-[#E3E5E8]/40 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-[2px] before:bg-brass"
                    : "text-slate hover:text-midnight hover:bg-[#E3E5E8]/20 font-medium"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </aside>

        {/* Content area: max width 1280px */}
        <main
          id="portal-main-content"
          tabIndex={-1}
          className="flex-1 w-full p-6 md:p-8 pb-24 md:pb-8 outline-none"
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom bar: 5 items, each >= 44px tall */}
      <nav
        aria-label="Mobile portal navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-chalk border-t border-[#CFCFCB] flex items-center justify-around px-2"
      >
        {bottomBarItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== portalPrefix && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex-1 flex flex-col items-center justify-center min-h-[48px] h-[52px] text-xs font-sans transition-colors rounded-[2px]",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight",
                isActive
                  ? "font-semibold text-midnight border-t-2 border-brass -mt-[1px]"
                  : "text-slate hover:text-midnight font-medium"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className="truncate max-w-[70px]">{item.label}</span>
            </Link>
          );
        })}

        {/* 5th slot: More button if more than 5 nav items */}
        {hasMore && (
          <button
            type="button"
            onClick={() => setMobileMoreOpen((open) => !open)}
            aria-expanded={mobileMoreOpen}
            aria-label="More navigation items"
            className={cn(
              "flex-1 flex flex-col items-center justify-center min-h-[48px] h-[52px] text-xs font-sans transition-colors rounded-[2px]",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight",
              isOverflowActive || mobileMoreOpen
                ? "font-semibold text-midnight border-t-2 border-brass -mt-[1px]"
                : "text-slate hover:text-midnight font-medium"
            )}
          >
            <MoreHorizontal className="size-4 stroke-[1.5]" />
            <span className="truncate max-w-[70px]">More</span>
          </button>
        )}
      </nav>

      {/* Mobile "More" Drawer */}
      {mobileMoreOpen && hasMore && (
        <div
          role="dialog"
          aria-label="Additional navigation items"
          className="md:hidden fixed bottom-[52px] left-0 right-0 z-40 bg-chalk border-t border-[#CFCFCB] p-4 shadow-menu space-y-2 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-[#CFCFCB]">
            <span className="font-sans text-xs text-slate">Additional links</span>
            <button
              type="button"
              onClick={() => setMobileMoreOpen(false)}
              aria-label="Close more navigation menu"
              className="p-1 text-slate hover:text-midnight rounded-[2px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight"
            >
              <X className="size-4 stroke-[1.5]" />
            </button>
          </div>
          {overflowItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== portalPrefix && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMoreOpen(false)}
                className={cn(
                  "block py-3 px-3 min-h-[44px] text-sm font-sans rounded-[2px] transition-colors",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight",
                  isActive
                    ? "font-semibold text-midnight bg-[#E3E5E8]/50"
                    : "text-slate hover:text-midnight font-medium"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
