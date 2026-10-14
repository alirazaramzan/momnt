import React from "react";
import { PortalLayout } from "@/components/layout";
import { PHOTOGRAPHER_NAV_ITEMS } from "@/components/layout/nav-config";

export default function PhotographerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      portalName="Photographer"
      portalPrefix="/photographer"
      navItems={PHOTOGRAPHER_NAV_ITEMS}
    >
      {children}
    </PortalLayout>
  );
}
