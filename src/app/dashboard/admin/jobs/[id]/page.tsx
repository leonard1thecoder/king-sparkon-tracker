import type { Metadata } from "next";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";
import { JobApplicationsPanel } from "@/components/jobs/JobApplicationsPanel";
import { JobOpportunityDetail } from "@/components/jobs/JobOpportunityDetail";

export const metadata: Metadata = {
  title: "Manage Job Opportunity | Admin Dashboard",
  description: "Review a job opportunity and applications from the admin dashboard.",
};

export default async function AdminJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <DashboardFrame role="Admin" nav={<DashboardRoleNav role="Admin" />}>
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <JobOpportunityDetail id={id} canApply={false} />
        <JobApplicationsPanel jobId={id} scope="manage" />
      </main>
    </DashboardFrame>
  );
}
