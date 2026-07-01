import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { JobOpportunityBoard } from "@/components/jobs/JobOpportunityBoard";

export const metadata: Metadata = {
  title: "Job Opportunities | King Sparkon Tracker",
  description: "Browse open job opportunities from King Sparkon Tracker businesses and apply through a clean role-aware application flow.",
  alternates: { canonical: "/jobs" },
};

export default function JobsPage() {
  return (
    <main className="min-h-screen bg-[var(--surface)] p-5 text-[var(--ink)] md:p-8">
      <div className="mx-auto grid max-w-7xl gap-6">
        <Link href="/" className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm font-black text-[var(--steel)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)] hover:text-[var(--ink)]">
          <ArrowLeft className="h-4 w-4" /> Back home
        </Link>
        <JobOpportunityBoard audience="public" />
      </div>
    </main>
  );
}
