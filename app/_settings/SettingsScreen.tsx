import React from "react";
import { redirect } from "next/navigation";
import { Card, Skeleton } from "@/components/ui";
import { loadSettings } from "./data";
import { SettingsClient } from "./SettingsClient";

/**
 * Loads the signed-in user's settings. Rendered inside <Suspense> by each
 * portal's settings page, because it reads the session cookies.
 */
export async function SettingsScreen() {
  const result = await loadSettings();

  if (result.status === "signed-out") redirect("/sign-in");

  if (result.status === "error") {
    return (
      <Card className="p-6 max-w-2xl" role="alert">
        <p className="font-sans text-sm font-semibold text-midnight">
          We could not load your settings
        </p>
        <p className="font-sans text-sm text-slate mt-1">
          Check your connection, then refresh this page.
        </p>
      </Card>
    );
  }

  return <SettingsClient initial={result.data} />;
}

/** Loading state: skeleton blocks in mist. */
export function SettingsSkeleton() {
  return (
    <div className="space-y-8 max-w-2xl" aria-busy="true" aria-label="Loading settings">
      <Card className="p-6 space-y-6">
        <Skeleton className="h-5 w-40" />
        <div className="flex items-center gap-4">
          <Skeleton className="size-14 rounded-full" />
          <Skeleton className="h-8 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </Card>
      <Card className="p-6 space-y-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-10 w-40" />
      </Card>
    </div>
  );
}

