import type { Metadata } from "next";
import { JobOpportunityDetail } from "@/components/jobs/JobOpportunityDetail";

export const metadata: Metadata = {
  title: "Job Detail | King Sparkon Tracker",
  description: "Review a King Sparkon Tracker job opportunity and submit an application.",
};

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-[var(--surface)] p-5 text-[var(--ink)] md:p-8">
      <div className="mx-auto max-w-7xl">
        <JobOpportunityDetail id={id} />
      </div>
    </main>
  );
}
