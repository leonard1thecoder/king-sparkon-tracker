import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerDashboardHome } from "@/components/worker/WorkerDashboardHome";

export default function WorkerDashboardPage() {
  return (
    <>
      <DashboardHeader role="WORKER TERMINAL" title="Worker Dashboard" description="Mall at staff price, tickets, counter checkout and tips in one place." />
      <main className="bg-white">
        <WorkerDashboardHome />
      </main>
    </>
  );
}
