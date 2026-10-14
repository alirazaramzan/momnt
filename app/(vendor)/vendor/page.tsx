import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/patterns";
import { Button, Chip, Card } from "@/components/ui";
import { MOCK_QUOTES, MOCK_LOCATIONS } from "@/lib/mock";

export default function VendorOverviewPage() {
  const quotes = MOCK_QUOTES;
  const location = MOCK_LOCATIONS[0];

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Overview"
        lede="Client quote inquiries, production orders, and studio availability."
      />

      {/* Quote inquiries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-semibold text-midnight">
            Recent quote requests
          </h2>
          <span className="font-sans text-xs text-slate">
            {quotes.length} active quotes
          </span>
        </div>

        <div className="divide-y divide-[#CFCFCB] border border-[#CFCFCB] rounded-[2px] bg-chalk">
          {quotes.map((q) => (
            <div
              key={q.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="font-sans text-base font-semibold text-midnight">
                    {q.vendorName}
                  </span>
                  <Chip variant={q.status === "accepted" ? "verified" : "neutral"}>
                    {q.status === "accepted" ? "Accepted" : "Quoted"}
                  </Chip>
                </div>
                <p className="font-sans text-xs text-slate">
                  {q.lineItems.map((li) => li.label).join(" + ")}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="font-sans text-sm font-semibold tabular-nums text-midnight">
                    PKR {q.total.toLocaleString()}
                  </div>
                  <div className="font-sans text-xs text-slate">Total quote</div>
                </div>
                <Link href="/vendor/quote-requests" tabIndex={-1}>
                  <Button variant="secondary" size="sm">
                    Review
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Location booking slot summary */}
      <div className="space-y-4 pt-4">
        <h2 className="font-sans text-lg font-semibold text-midnight">
          Managed location
        </h2>
        <Card className="p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="font-sans text-base font-semibold text-midnight">
                {location.name}
              </div>
              <p className="font-sans text-xs text-slate">
                {location.area}, {location.city} &bull; {location.capacity}
              </p>
            </div>
            <Link href="/vendor/calendar" tabIndex={-1}>
              <Button variant="quiet" size="sm">
                View calendar
              </Button>
            </Link>
          </div>
          <div className="pt-2 border-t border-[#CFCFCB] flex flex-wrap gap-2">
            {location.rules.map((rule) => (
              <span
                key={rule}
                className="font-sans text-xs text-slate bg-[#E3E5E8]/30 px-2.5 py-1 rounded-[2px]"
              >
                {rule}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
