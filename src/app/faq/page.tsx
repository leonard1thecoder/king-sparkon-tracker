import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { FaqRoleSlider } from "@/components/marketing/FaqRoleSlider";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "FAQ | King Sparkon Tracker — Questions by Role Answered",
  description:
    "Role-separated answers for users, businesses and affiliates: shop and tickets, tips and UIF, inventory and plans, referrals and payouts, billing, dashboards and data privacy.",
  path: "/faq",
});

export default function FaqPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8"><Breadcrumbs items={[{ label: "FAQ" }]} /></div>
        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Answers by role</p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">Questions users, businesses and affiliates actually ask.</h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">Pick your role for a separate FAQ. Each answer maps to a real screen, endpoint or policy you can verify.</p>
          </div>
        </section>
        <div className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-12">
          <FaqRoleSlider />
          <GlassCard variant="subtle" className="mx-auto mt-8 flex max-w-4xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm font-semibold text-[var(--steel)]">Still unsure which guide fits your job?</p>
            <Link href="/guides" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Browse guides <ArrowRight className="h-4 w-4" /></Link>
          </GlassCard>
        </div>
      </main>
    </>
  );
}
