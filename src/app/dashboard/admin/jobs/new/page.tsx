import type { Metadata } from "next";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";
import { JobOpportunityForm } from "@/components/jobs/JobOpportunityForm";

export const metadata: Metadata = {
  title: "Create Job Opportunity | Admin Dashboard",
  description: "Create a job opportunity from the King Sparkon Tracker admin dashboard.",
};

export default function AdminCreateJobPage() {
  return (
    <DashboardFrame role="Admin" nav={<DashboardRoleNav role="Admin" />}>
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <JobOpportunityForm audience="admin" />
      </main>
    </DashboardFrame>
  );
}
