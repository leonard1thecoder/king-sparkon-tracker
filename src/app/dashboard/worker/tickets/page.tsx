import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerTicketsWorkspace } from "@/components/worker/WorkerTicketsWorkspace";

export default function WorkerTicketsPage() {
  return (
    <>
      <DashboardHeader role="WORKER TERMINAL" title="Tickets" description="Browse events, keep your tickets, and scan buyers at the gate." />
      <main className="bg-white">
        <WorkerTicketsWorkspace />
      </main>
    </>
  );
}
