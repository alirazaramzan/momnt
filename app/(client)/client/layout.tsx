import React from "react";
import { PortalLayout } from "@/components/layout";
import { CLIENT_NAV_ITEMS } from "@/components/layout/nav-config";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      portalName="Client"
      portalPrefix="/client"
      navItems={CLIENT_NAV_ITEMS}
    >
      {children}
    </PortalLayout>
  );
}
