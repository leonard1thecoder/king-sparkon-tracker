import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardUserNav } from "@/components/nav/DashboardUserNav";

export default function UserLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame role="USER WORKSPACE" nav={<DashboardUserNav />}>{children}</DashboardFrame>;
}
