import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { BulkSubscriberImport } from "@/components/admin/BulkSubscriberImport";

export const metadata: Metadata = {
  title: "Bulk Subscriber Import | King Sparkon",
  description: "Import multiple subscribers from a CSV file.",
};

export default function AdminBulkImportPage() {
  return (
    <>
      <DashboardHeader
        role="ADMIN"
        title="Bulk Subscriber Import"
        description="Import multiple subscribers from a CSV file."
      />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <BulkSubscriberImport />
      </main>
    </>
  );
}
