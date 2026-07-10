import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { JobOpportunityBoard } from "@/components/jobs/JobOpportunityBoard";

export const metadata: Metadata = {
  title: "User Job Opportunities | King Sparkon Tracker",
  description: "User dashboard view for browsing job opportunities and applying through King Sparkon Tracker.",
};

export default function UserJobsPage() {
  return (
    <>
      <DashboardHeader
        role="USER WORKSPACE"
        title="Job opportunities"
        description="Browse roles from King Sparkon businesses, review the requirements, apply, and continue tracking your applications inside the user dashboard."
      />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <JobOpportunityBoard audience="user" title="Job opportunities for users" description="Browse roles, apply, and track your applications without losing the dashboard navigation." />
      </main>
    </>
  );
}
