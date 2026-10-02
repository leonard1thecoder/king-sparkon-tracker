import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { OwnerWorkerManager } from "@/components/workers/OwnerWorkerManager";

export const metadata: Metadata = {
  title: "Business Workers",
  description: "Create workers, choose tip privileges and manage business worker accounts.",
};

export default function OwnerWorkersPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Workers" description="Create worker accounts, choose whether each worker may receive tips, and manage the people assigned to your business." />
      <main className="page-main">
        <OwnerWorkerManager />
      </main>
    </>
  );
}
