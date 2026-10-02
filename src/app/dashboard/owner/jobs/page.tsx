import type { Metadata } from "next";
import { JobApplicationsPanel } from "@/components/jobs/JobApplicationsPanel";
import { JobOpportunityBoard } from "@/components/jobs/JobOpportunityBoard";

export const metadata: Metadata = {
  title: "Owner Job Opportunities | King Sparkon",
  description: "Owner dashboard for creating, publishing, closing, and reviewing job opportunities.",
};

export default async function OwnerJobsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;

  return (
    <main className="page-main bg-[var(--surface)]">
      {tab === "applications" ? <JobApplicationsPanel scope="manage" /> : <JobOpportunityBoard audience="owner" />}
    </main>
  );
}
