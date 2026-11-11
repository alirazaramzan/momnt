import type { Database } from "@/lib/database.types";

export type UserRole = Database["public"]["Enums"]["user_role"];

/** Where each role lands after signing in. */
const DASHBOARD_BY_ROLE: Record<UserRole, string> = {
  client: "/client",
  agency: "/client",
  photographer: "/photographer",
  vendor: "/vendor",
  admin: "/admin",
};

export function dashboardPathForRole(role: UserRole | null | undefined): string {
  return role ? DASHBOARD_BY_ROLE[role] : "/client";
}

/**
 * Accepts only same-site relative paths ("/reset-password"), so a crafted
 * link cannot send people to another website after the auth callback.
 */
export function safeNextPath(next: string | null | undefined): string | null {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) {
    return null;
  }
  return next;
}

