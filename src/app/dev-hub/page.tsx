import type { Metadata } from "next";
import Link from "next/link";
import { Code2, ArrowRight } from "lucide-react";
import { DevHubAiConsole } from "@/components/dev-hub/DevHubAiConsole";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Dev Hub | Software Requests, AI Estimates & Project Plans",
  description:
    "King Sparkon Dev Hub handles software requests with AI-generated price estimates, plan proposals and owner accept or reject workflows — from inquiry to delivery.",
  path: "/dev-hub",
});

export default function DevHubPage() {
  return (
    <>
      <PremiumHeader />
      <main className="min-h-screen bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "Dev Hub" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-white via-[var(--signal-soft)] to-white" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-8 md:px-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]"><Code2 className="h-3.5 w-3.5" /> Dev Hub</p>
            <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">From software request to priced plan — no guesswork.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--steel)]">Submit a software request, receive an automated price estimate and phased plan, then accept or reject from the owner console. Every request is tracked via <code className="rounded bg-[var(--signal-soft)] px-1.5 py-0.5 font-mono text-xs">/api/dev-hub/requests</code> with stage progression.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/guides/barcode-inventory-guide" className="text-sm font-bold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">Platform guides →</Link>
              <Link href="/contact" className="text-sm font-bold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">Discuss a build →</Link>
            </div>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <GlassCard variant="subtle" className="mb-6">
            <p className="text-sm font-semibold text-[var(--steel)]">AI estimates are advisory and always require owner review before work begins. The console is available to signed-in business owners; this public intro explains the flow before you register.</p>
          </GlassCard>
          <DevHubAiConsole />
          <GlassCard className="mt-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-[var(--steel)]">Want the full capability map including billing, reports and audit?</p>
            <Link href="/features" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-4 py-2 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">View features <ArrowRight className="h-4 w-4" /></Link>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
