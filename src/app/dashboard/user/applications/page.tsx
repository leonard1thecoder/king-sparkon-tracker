import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { JobApplicationsPanel } from "@/components/jobs/JobApplicationsPanel";

export const metadata: Metadata = {
  title: "My Applications | King Sparkon Tracker",
  description: "Track submitted job applications from the King Sparkon Tracker user dashboard.",
};

export default function UserApplicationsPage() {
  return (
    <>
      <DashboardHeader
        role="USER WORKSPACE"
        title="My applications"
        description="Track every submitted job application, review the current status, and keep your career activity inside the user dashboard."
      />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <JobApplicationsPanel scope="mine" />
      </main>
    </>
  );
}
