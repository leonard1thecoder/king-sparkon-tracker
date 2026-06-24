import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { AffiliateNav } from "@/components/nav/AffiliateNav";

export default function AffiliateLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame role="AFFILIATE LEDGER" nav={<AffiliateNav />}>{children}</DashboardFrame>;
}
