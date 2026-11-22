import React, { Suspense } from "react";
import { SectionHeader } from "@/components/patterns";
import { SettingsScreen, SettingsSkeleton } from "@/app/_settings/SettingsScreen";

export default function VendorSettingsPage() {
  return (
    <div className="space-y-8">
      <SectionHeader title="Settings" lede="Your account details." />
      <Suspense fallback={<SettingsSkeleton />}>
        <SettingsScreen />
      </Suspense>
    </div>
  );
}

