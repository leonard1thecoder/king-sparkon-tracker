import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerTipsWorkspace } from "@/components/tips/WorkerTipsWorkspace";

export const metadata: Metadata = {
  title: "Worker Tips & QR",
  description: "Worker tip QR code with tip payment history.",
};

export default function WorkerTipsPage() {
  return (
    <>
      <DashboardHeader role="WORKER" title="Tips & QR" description="Show your personal tip QR to customers, then review every tip record below it." />
      <main className="p-5 md:p-8">
        <WorkerTipsWorkspace />
      </main>
    </>
  );
}
