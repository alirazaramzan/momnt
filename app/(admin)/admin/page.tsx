import React from "react";
import Link from "next/link";
import { SectionHeader } from "@/components/patterns";
import { Button, Chip, Card } from "@/components/ui";
import { MOCK_PHOTOGRAPHERS } from "@/lib/mock";

export default function AdminVerificationQueuePage() {
  const pendingPhotographers = MOCK_PHOTOGRAPHERS.filter(
    (p) => p.status === "under_review" || p.status === "pending"
  );
  const reviewedPhotographers = MOCK_PHOTOGRAPHERS.filter(
    (p) => p.status === "verified"
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        title="Verification queue"
        lede="Review portfolio original submissions, equipment checks, and identity verification."
      />

      {/* Pending review items */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-sans text-lg font-semibold text-midnight">
            Pending review ({pendingPhotographers.length})
          </h2>
          <span className="font-sans text-xs text-slate">
            Target SLA: 48 hours
          </span>
        </div>

        {pendingPhotographers.length > 0 ? (
          <div className="space-y-4">
            {pendingPhotographers.map((photographer) => (
              <Card key={photographer.id} className="p-6 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-[24px] leading-tight text-midnight">
                        {photographer.name}
                      </h3>
                      <Chip variant="brass-outline">Under review</Chip>
                    </div>
                    <p className="font-sans text-xs text-slate">
                      {photographer.city} &bull; Specialisations: {photographer.specialisations.join(", ")}
                    </p>
                    <p className="font-sans text-sm text-slate pt-2 max-w-xl">
                      {photographer.bio}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Button variant="secondary" size="md">
                      Request info
                    </Button>
                    <Button variant="primary" size="md">
                      Approve verification
                    </Button>
                  </div>
                </div>

                {/* Verification flags */}
                <div className="pt-3 border-t border-[#CFCFCB] flex flex-wrap items-center gap-4 text-xs font-sans text-slate">
                  <span>EXIF metadata: Verified</span>
                  <span>Portfolio duplicate scan: 0 matches</span>
                  <span>ID document: Clear</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="font-sans text-sm text-slate">No pending verifications.</p>
        )}
      </div>

      {/* Recently verified */}
      <div className="space-y-4 pt-4">
        <h2 className="font-sans text-lg font-semibold text-midnight">
          Recently verified
        </h2>

        <div className="divide-y divide-[#CFCFCB] border border-[#CFCFCB] rounded-[2px] bg-chalk">
          {reviewedPhotographers.map((p) => (
            <div
              key={p.id}
              className="p-4 flex items-center justify-between gap-4"
            >
              <div>
                <div className="font-sans text-sm font-semibold text-midnight">
                  {p.name}
                </div>
                <div className="font-sans text-xs text-slate">
                  {p.city} &bull; Rating {p.rating} &bull; {p.packages.length} packages active
                </div>
              </div>
              <Chip variant="verified">Verified</Chip>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
