import React from "react";
import Link from "next/link";
import { Logo } from "@/components/brand";

const FOOTER_LINKS = [
  { href: "/photographers", label: "Photographers" },
  { href: "/gigs", label: "Gigs" },
  { href: "/academy", label: "Academy" },
  { href: "/vendors", label: "Vendors" },
];

export function PublicFooter() {
  return (
    <footer className="w-full bg-chalk border-t border-[#CFCFCB] mt-auto">
      <div className="max-w-[1120px] mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
        {/* Wordmark and promise */}
        <div className="space-y-2">
          <Link
            href="/"
            aria-label="Momnt home"
            className="inline-block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
          >
            <Logo size="sm" />
          </Link>
          <p className="font-sans text-xs text-slate">
            Every moment, in trusted hands.
          </p>
        </div>

        {/* Four plain links */}
        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap items-center gap-6"
        >
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm text-slate hover:text-midnight transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px] py-1"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
