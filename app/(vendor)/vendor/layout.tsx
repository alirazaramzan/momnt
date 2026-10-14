import React from "react";
import { PortalLayout } from "@/components/layout";
import { VENDOR_NAV_ITEMS } from "@/components/layout/nav-config";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      portalName="Vendor"
      portalPrefix="/vendor"
      navItems={VENDOR_NAV_ITEMS}
    >
      {children}
    </PortalLayout>
  );
}
