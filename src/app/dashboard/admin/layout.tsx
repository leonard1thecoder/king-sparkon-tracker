import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { AdminNav } from "@/components/nav/AdminNav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame role="ADMIN CONSOLE" nav={<AdminNav />}>{children}</DashboardFrame>;
}
