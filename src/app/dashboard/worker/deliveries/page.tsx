import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DeliveryWorkspace } from "@/components/tuck-shop/DeliveryWorkspace";

export default function WorkerDeliveriesPage() {
  return (
    <>
      <DashboardHeader role="WORKER TERMINAL" title="Deliveries" description="Paid delivery orders with addresses, fees and lead times." />
      <main className="bg-white">
        <div className="p-5 md:p-8">
          <DeliveryWorkspace />
        </div>
      </main>
    </>
  );
}
