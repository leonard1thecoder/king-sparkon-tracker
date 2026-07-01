import type { Metadata } from "next";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";
import { JobApplicationsPanel } from "@/components/jobs/JobApplicationsPanel";
import { JobOpportunityBoard } from "@/components/jobs/JobOpportunityBoard";

export const metadata: Metadata = {
  title: "Admin Job Opportunities | King Sparkon Tracker",
  description: "Admin dashboard for reviewing platform job opportunities and applications.",
};

export default async function AdminJobsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;

  return (
    <DashboardFrame role="Admin" nav={<DashboardRoleNav role="Admin" />}>
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        {tab === "applications" ? <JobApplicationsPanel scope="manage" /> : <JobOpportunityBoard audience="admin" title="Platform job opportunities" description="Admin can monitor all jobs, publish valid roles, close filled roles, and keep applications visible." />}
      </main>
    </DashboardFrame>
  );
}
