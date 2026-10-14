import type { PortalNavItem } from "./PortalLayout";

export const CLIENT_NAV_ITEMS: PortalNavItem[] = [
  { href: "/client", label: "Overview" },
  { href: "/client/bookings", label: "Bookings" },
  { href: "/client/gigs", label: "My gigs" },
  { href: "/client/galleries", label: "Galleries" },
  { href: "/client/messages", label: "Messages" },
  { href: "/client/academy", label: "Academy" },
];

export const PHOTOGRAPHER_NAV_ITEMS: PortalNavItem[] = [
  { href: "/photographer", label: "Overview" },
  { href: "/photographer/calendar", label: "Calendar" },
  { href: "/photographer/requests", label: "Requests" },
  { href: "/photographer/projects", label: "Projects" },
  { href: "/photographer/gigs", label: "Gigs" },
  { href: "/photographer/bids", label: "My bids" },
  { href: "/photographer/academy", label: "Academy" },
];

export const VENDOR_NAV_ITEMS: PortalNavItem[] = [
  { href: "/vendor", label: "Overview" },
  { href: "/vendor/quote-requests", label: "Quote requests" },
  { href: "/vendor/orders", label: "Orders" },
  { href: "/vendor/calendar", label: "Calendar" },
  { href: "/vendor/reviews", label: "Reviews" },
];

export const ADMIN_NAV_ITEMS: PortalNavItem[] = [
  { href: "/admin", label: "Verification queue" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/gigs", label: "Gigs" },
  { href: "/admin/courses", label: "Courses" },
  { href: "/admin/reports", label: "Reports" },
];
