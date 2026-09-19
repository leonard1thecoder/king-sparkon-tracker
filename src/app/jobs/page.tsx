import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness } from "lucide-react";
import { JobOpportunityBoard } from "@/components/jobs/JobOpportunityBoard";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Job Opportunities | Businesses Hiring via King Sparkon",
  description:
    "Browse open job opportunities published by King Sparkon businesses. Filter by workplace, employment and experience level, and apply with role-aware application tracking.",
  path: "/jobs",
});

export default function JobsPage() {
  return (
    <>
      <PremiumHeader />
      <main className="min-h-screen bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Jobs" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]"><BriefcaseBusiness className="h-3.5 w-3.5" /> Jobs</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">Open opportunities from operating businesses.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--steel)]">Roles are published by Business Owners and reviewed from <code className="rounded bg-[var(--signal-soft)] px-1.5 py-0.5 font-mono text-xs">/dashboard/owner/jobs</code>. Applications carry status from SUBMITTED to ACCEPTED — no hidden ATS. If you own a business, publish from your owner dashboard instead of this public board.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/guides/barcode-inventory-guide" className="text-sm font-bold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">Learn barcode operations →</Link>
              <Link href="/how-it-works" className="text-sm font-bold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">How applications flow →</Link>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <GlassCard variant="subtle" className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-[var(--steel)]">Public board — no login required to browse. Apply from the job detail page.</p>
            <Link href="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm font-extrabold hover:border-[var(--signal)]">Hiring? Create a business account <ArrowRight className="h-4 w-4" /></Link>
          </GlassCard>
          <JobOpportunityBoard audience="public" />
        </div>
      </main>
    </>
  );
}
