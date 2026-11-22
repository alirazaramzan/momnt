import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function PhotographerNotFound() {
  return (
    <div className="w-full bg-chalk text-midnight py-16 sm:py-24">
      <div className="max-w-[640px] mx-auto px-6 space-y-6 text-left">
        <div className="space-y-2">
          <p className="font-sans text-xs text-slate tabular-nums">404</p>
          <h1 className="font-display text-[32px] leading-tight font-normal text-midnight">
            Photographer not found
          </h1>
          <p className="font-sans text-sm sm:text-base text-slate leading-relaxed">
            This profile does not exist or is not yet open to the public.
          </p>
        </div>
        <div>
          <Link href="/photographers" tabIndex={-1}>
            <Button variant="primary" size="md">
              Browse verified photographers
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

