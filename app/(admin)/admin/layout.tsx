import React from "react";
import { PortalLayout } from "@/components/layout";
import { ADMIN_NAV_ITEMS } from "@/components/layout/nav-config";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PortalLayout
      portalName="Admin"
      portalPrefix="/admin"
      navItems={ADMIN_NAV_ITEMS}
    >
      {children}
    </PortalLayout>
  );
}
