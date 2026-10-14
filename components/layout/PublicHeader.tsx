"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/brand";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const PUBLIC_LINKS = [
  { href: "/photographers", label: "Photographers" },
  { href: "/gigs", label: "Gigs" },
  { href: "/academy", label: "Academy" },
  { href: "/vendors", label: "Vendors" },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full bg-chalk border-b border-[#CFCFCB] sticky top-0 z-40">
      <div className="max-w-[1120px] mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            aria-label="Momnt home"
            className="focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
          >
            <Logo size="sm" />
          </Link>

          {/* Desktop navigation links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-7"
          >
            {PUBLIC_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "font-sans text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px] py-1",
                    isActive
                      ? "text-midnight font-semibold"
                      : "text-midnight/80 hover:text-midnight"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side: Quiet sign-in button & mobile hamburger */}
        <div className="flex items-center gap-2">
          <Link href="/sign-in" tabIndex={-1} className="hidden sm:inline-flex">
            <Button
              variant="quiet"
              size="md"
              className="text-sm font-sans font-medium"
            >
              Sign in
            </Button>
          </Link>

          {/* Mobile hamburger button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            className="md:hidden p-2 text-midnight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
          >
            {mobileMenuOpen ? (
              <X className="size-5 stroke-[1.5]" />
            ) : (
              <Menu className="size-5 stroke-[1.5]" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile navigation"
          className="md:hidden border-t border-[#CFCFCB] bg-chalk px-6 py-4 space-y-3 animate-in fade-in duration-200"
        >
          {PUBLIC_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "block py-2.5 font-sans text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]",
                  isActive
                    ? "text-midnight font-semibold"
                    : "text-midnight/80 hover:text-midnight"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="pt-2 border-t border-[#CFCFCB]">
            <Link
              href="/sign-in"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2.5 font-sans text-base font-semibold text-midnight hover:opacity-80"
            >
              Sign in
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
