import type { Metadata } from "next";
import { DashboardFrame } from "../../dashboard-shell";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";
import { DeveloperHubWorkspace } from "@/components/developer-hub/DeveloperHubWorkspace";

export const metadata: Metadata = {
  title: "Owner Developer Hub | King Sparkon Tracker",
  description: "Owner workspace for requesting software development, cloud maintenance, Quality Assurance regression, and King Sparkon Dev Hub free quotes.",
};

export default function OwnerDeveloperHubPage() {
  return (
    <DashboardFrame role="Owner" nav={<DashboardRoleNav role="Owner" />}>
      <DashboardHeader
        role="Owner"
        title="Owner Developer Hub"
        description="Request software development, explain how the software should work, require cloud maintenance, and request Quality Assurance regression support."
      />
      <DeveloperHubWorkspace scope="owner" />
    </DashboardFrame>
  );
}
