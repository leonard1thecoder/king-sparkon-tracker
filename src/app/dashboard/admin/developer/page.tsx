import type { Metadata } from "next";
import { DashboardFrame } from "../../dashboard-shell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";
import { DeveloperHubWorkspace } from "@/components/developer-hub/DeveloperHubWorkspace";

export const metadata: Metadata = {
  title: "Admin Developer Hub | King Sparkon Tracker",
  description: "Admin workspace for viewing software development requests and starting King Sparkon Dev Hub delivery stages.",
};

export default function AdminDeveloperHubPage() {
  return (
    <DashboardFrame role="Admin" nav={<DashboardRoleNav role="Admin" />}>
      <DashboardHeader
        role="Admin"
        title="Admin Developer Hub"
        description="View requested software development work, start discovery, and move delivery through quote, design, development, CI/CD, QA regression, cloud maintenance, UAT, and support."
      />
      <DeveloperHubWorkspace scope="admin" />
    </DashboardFrame>
  );
}
