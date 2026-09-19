import type { Metadata } from "next";
import { JobOpportunityForm } from "@/components/jobs/JobOpportunityForm";

export const metadata: Metadata = {
  title: "Create Job Opportunity | Owner Dashboard",
  description: "Create a job opportunity from the King Sparkon owner dashboard.",
};

export default function OwnerCreateJobPage() {
  return (
    <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
      <JobOpportunityForm audience="owner" />
    </main>
  );
}
