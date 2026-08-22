import { redirect } from "next/navigation";

export default function WorkerDashboardPage() {
  redirect("/dashboard/worker/scan");
}
