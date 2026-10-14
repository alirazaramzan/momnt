import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";

export default function HomePage() {
  return (
    <div className="w-full py-16 md:py-24">
      <div className="max-w-[1120px] mx-auto px-6 space-y-16">
        {/* Hero Section */}
        <div className="max-w-2xl space-y-6">
          <h1 className="font-display text-[40px] md:text-[56px] leading-[1.1] font-normal text-midnight">
            Every moment, in trusted hands.
          </h1>
          <p className="font-sans text-[16px] leading-[26px] text-slate">
            Find verified photographers, compare clear prices and book your
            date, or post a gig and let photographers bid.
          </p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-2">
            <Link href="/client" tabIndex={-1} className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Enter client portal
              </Button>
            </Link>
            <Link href="/photographer" tabIndex={-1} className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Photographer portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Portal shells directory */}
        <div className="space-y-6 pt-8 border-t border-[#CFCFCB]">
          <div className="space-y-1">
            <h2 className="font-sans text-[22px] leading-[30px] font-semibold text-midnight">
              Platform portals
            </h2>
            <p className="font-sans text-[13px] leading-[18px] text-slate">
              Each role has a tailored shell sharing the same tokens and navigation structure.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/client"
              className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
            >
              <Card className="p-5 h-full space-y-2 hover:bg-[#E3E5E8]/30 transition-colors">
                <div className="font-sans text-base font-semibold text-midnight">
                  Client portal
                </div>
                <p className="font-sans text-xs text-slate">
                  Overview, Bookings, My gigs, Galleries, Messages, Academy.
                </p>
              </Card>
            </Link>

            <Link
              href="/photographer"
              className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
            >
              <Card className="p-5 h-full space-y-2 hover:bg-[#E3E5E8]/30 transition-colors">
                <div className="font-sans text-base font-semibold text-midnight">
                  Photographer portal
                </div>
                <p className="font-sans text-xs text-slate">
                  Overview, Calendar, Requests, Projects, Gigs, My bids, Academy.
                </p>
              </Card>
            </Link>

            <Link
              href="/vendor"
              className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
            >
              <Card className="p-5 h-full space-y-2 hover:bg-[#E3E5E8]/30 transition-colors">
                <div className="font-sans text-base font-semibold text-midnight">
                  Vendor portal
                </div>
                <p className="font-sans text-xs text-slate">
                  Overview, Quote requests, Orders, Calendar, Reviews.
                </p>
              </Card>
            </Link>

            <Link
              href="/admin"
              className="block group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-midnight rounded-[2px]"
            >
              <Card className="p-5 h-full space-y-2 hover:bg-[#E3E5E8]/30 transition-colors">
                <div className="font-sans text-base font-semibold text-midnight">
                  Admin portal
                </div>
                <p className="font-sans text-xs text-slate">
                  Verification queue, Users, Bookings, Gigs, Courses, Reports.
                </p>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
