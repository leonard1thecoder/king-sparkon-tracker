import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { WorkerMallWorkspace } from "@/components/worker/WorkerMallWorkspace";

export default function WorkerMallPage() {
  return (
    <>
      <DashboardHeader role="WORKER TERMINAL" title="Staff Mall" description="Buy mall products at your staff price. The owner-set staff % applies automatically." />
      <main className="bg-white">
        <WorkerMallWorkspace />
      </main>
    </>
  );
}
