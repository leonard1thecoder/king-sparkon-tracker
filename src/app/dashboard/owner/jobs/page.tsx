import type { Metadata } from "next";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";
import { JobApplicationsPanel } from "@/components/jobs/JobApplicationsPanel";
import { JobOpportunityBoard } from "@/components/jobs/JobOpportunityBoard";

export const metadata: Metadata = {
  title: "Owner Job Opportunities | King Sparkon Tracker",
  description: "Owner dashboard for creating, publishing, closing, and reviewing job opportunities.",
};

export default async function OwnerJobsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;

  return (
    <DashboardFrame role="Owner" nav={<DashboardRoleNav role="Owner" />}>
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        {tab === "applications" ? <JobApplicationsPanel scope="manage" /> : <JobOpportunityBoard audience="owner" />}
      </main>
    </DashboardFrame>
  );
}
