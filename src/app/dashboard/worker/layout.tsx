import type { ReactNode } from "react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { WorkerNav } from "@/components/nav/WorkerNav";

export default function WorkerLayout({ children }: { children: ReactNode }) {
  return <DashboardFrame role="WORKER TERMINAL" nav={<WorkerNav />}>{children}</DashboardFrame>;
}
