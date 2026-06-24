import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { OwnerNav } from "@/components/nav/OwnerNav";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame role="OWNER LEDGER" nav={<OwnerNav />}>{children}</DashboardFrame>;
}
