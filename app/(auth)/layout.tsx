import React from "react";
import { AuthSplitShell } from "@/components/layout";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthSplitShell>{children}</AuthSplitShell>;
}
