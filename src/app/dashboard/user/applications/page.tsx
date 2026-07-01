import type { Metadata } from "next";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";
import { JobApplicationsPanel } from "@/components/jobs/JobApplicationsPanel";

export const metadata: Metadata = {
  title: "My Applications | King Sparkon Tracker",
  description: "Track submitted job applications from the King Sparkon Tracker user dashboard.",
};

export default function UserApplicationsPage() {
  return (
    <DashboardFrame role="User" nav={<DashboardRoleNav role="User" />}>
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <JobApplicationsPanel scope="mine" />
      </main>
    </DashboardFrame>
  );
}
