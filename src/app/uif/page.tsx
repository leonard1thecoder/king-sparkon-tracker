import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Calculator, Landmark, ShieldCheck, UserCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { GlassCard } from "@/components/ui/GlassCard";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";
import { UifServiceSlider } from "@/components/marketing/UifServiceSlider";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "UIF System & POPIA Portal | Status Check, Password Reset & Calculator",
  description:
    "Official King Sparkon portal for South Africa Unemployment Insurance Fund (UIF) Online System services: check claim status, request password updates, calculate contributions under strict POPIA compliance.",
  path: "/uif",
  keywords: ["UIF South Africa", "UIF Status Check", "UIF Password Update", "UIF Calculator", "POPIA Compliance UIF"],
});

export default function UifPortalPage() {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <Breadcrumbs items={[{ label: "UIF System & POPIA Portal" }]} />
        </div>

        <section className="relative overflow-hidden border-y border-[var(--line)]">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-white to-white" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
            <p className="inline-flex rounded-full border border-[var(--signal)]/20 bg-white px-3 py-1 text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">
              Public Service Portal
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-5xl">
              UIF Online System & POPIA Data Protection
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)]">
              King Sparkon Tracker provides South African citizens with direct access to Department of Employment and Labour UIF Online services under strict Protection of Personal Information Act (POPIA) safeguards.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/uif#uif-status" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">
                Check UIF Status <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/uif#uif-password" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">
                Update UIF Password
              </Link>
              <Link href="/uif#uif-calculator" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">
                <Calculator className="h-4 w-4" /> UIF Calculator
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 md:py-14">
          <UifServiceSlider />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <GlassCard variant="subtle" className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black">Check UIF Status</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                  Verify benefit application status, claim numbers, and application dates directly using your 13-digit SA ID number at <Link href="/dashboard/user/uif/status" className="font-bold text-[var(--signal-strong)] hover:underline">/dashboard/user/uif/status</Link>.
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black">Update UIF Password</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                  Reset or update your UIF Online portal password securely with standard 8-12 character rules at <Link href="/dashboard/user/uif/password" className="font-bold text-[var(--signal-strong)] hover:underline">/dashboard/user/uif/password</Link>.
                </p>
              </div>
            </GlassCard>

            <GlassCard variant="subtle" className="flex gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-white text-[var(--signal)]">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-black">POPIA Compliance Safeguard</h2>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
                  Personal identifiers are processed strictly on-demand. Your 13-digit ID and password reset details are never sold, cached, or shared with third parties.
                </p>
              </div>
            </GlassCard>
          </div>
        </section>
      </main>
    </>
  );
}
