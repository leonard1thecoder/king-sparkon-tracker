import type { Metadata } from "next";
import { JobApplicationsPanel } from "@/components/jobs/JobApplicationsPanel";
import { JobOpportunityDetail } from "@/components/jobs/JobOpportunityDetail";

export const metadata: Metadata = {
  title: "Manage Job Opportunity | Owner Dashboard",
  description: "Review a job opportunity and its applications from the owner dashboard.",
};

export default async function OwnerJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
      <JobOpportunityDetail id={id} canApply={false} />
      <JobApplicationsPanel jobId={id} scope="manage" />
    </main>
  );
}
