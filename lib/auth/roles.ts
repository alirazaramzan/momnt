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

/** The sign-in screen. Portal guards send signed-out people here with ?next=. */
export const SIGN_IN_PATH = "/sign-in";

/** Which roles may open each portal. Anything not listed here is public. */
export const PORTAL_ROLES = {
  "/client": ["client", "agency"],
  "/photographer": ["photographer"],
  "/vendor": ["vendor"],
  "/admin": ["admin"],
} as const satisfies Record<string, readonly UserRole[]>;

export type PortalPath = keyof typeof PORTAL_ROLES;

/** "/photographer/calendar" -> "/photographer". Public paths return null. */
export function portalForPath(pathname: string): PortalPath | null {
  const portals = Object.keys(PORTAL_ROLES) as PortalPath[];
  return portals.find((p) => pathname === p || pathname.startsWith(p + "/")) ?? null;
}

/** True when the role may open the path. Public paths are open to everyone. */
export function canRoleAccessPath(role: UserRole | null | undefined, pathname: string): boolean {
  const portal = portalForPath(pathname);
  if (!portal) return true;
  if (!role) return false;
  return (PORTAL_ROLES[portal] as readonly UserRole[]).includes(role);
}

/** "/sign-in?next=%2Fphotographer%2Fcalendar". Unsafe return paths are dropped. */
export function signInPathWithReturn(returnTo: string | null | undefined): string {
  const next = safeNextPath(returnTo);
  return next ? `${SIGN_IN_PATH}?next=${encodeURIComponent(next)}` : SIGN_IN_PATH;
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

