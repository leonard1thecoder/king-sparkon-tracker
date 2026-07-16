"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, CloudCog, Code2, GitBranch, ShieldCheck, Sparkles } from "lucide-react";
import { BouncingCircleField, type BouncingCircleItem } from "@/components/marketing/BouncingCircleField";
import { DevHub3DVisual } from "@/components/marketing/Landing3DVisuals";

const devHubStats: readonly BouncingCircleItem[] = [
  { eyebrow: "Free", icon: Sparkles, title: "Software quote", copy: "Scope the product, roadmap, cloud needs, and release path before the build starts." },
  { eyebrow: "CI/CD", icon: GitBranch, title: "Continuous integration", copy: "Build, test, deploy, and release with cleaner automation instead of manual chaos." },
  { eyebrow: "QA", icon: ShieldCheck, title: "Lifetime quality support", copy: "Regression thinking, negative and positive tests, release confidence, and product hardening." },
  { eyebrow: "Cloud", icon: CloudCog, title: "Maintenance support", copy: "Cloud maintenance, monitoring discipline, uptime thinking, and production readiness." },
];

const devHubStrengths: readonly BouncingCircleItem[] = [
  { icon: Code2, title: "Software development", copy: "Web apps, dashboards, portals, scanning flows, payment flows, and business tools." },
  { icon: GitBranch, title: "Continuous integration development", copy: "GitHub workflows, test gates, deployment flow, branch discipline, and release checks." },
  { icon: ShieldCheck, title: "Quality assurance", copy: "Unit tests, edge cases, negative paths, regression coverage, and user-flow validation." },
  { icon: BadgeCheck, title: "Lifetime support", copy: "Long-term product improvement, issue review, maintenance planning, and safer upgrades." },
  { icon: CloudCog, title: "Cloud maintenance", copy: "Backend uptime, cloud hosting discipline, environment checks, and support after launch." },
];

export function DevHubSection() {
  return (
    <section id="dev-hub" className="scroll-mt-28 border-y border-[var(--line)] bg-white px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">King Sparkon Dev Hub</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Build software with production discipline.</h2>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--steel)]">
              Software development, continuous integration, quality assurance, lifetime support, and cloud maintenance start with a clear free quote.
            </p>
          </div>

          <DevHub3DVisual />
        </div>

        <div className="mt-10 rounded-xl border border-[var(--line-strong)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--line)] bg-[var(--signal-soft)] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--signal-strong)]">
            <Sparkles className="h-4 w-4" /> King Sparkon strengths
          </div>
          <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-[var(--ink)]">Built, tested, deployed, maintained, and improved properly.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link data-orange-hover="true" href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-6 font-black text-white hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)]">
              Start business trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/dashboard/owner/developer" className="inline-flex min-h-12 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-white px-6 font-bold text-[var(--ink)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]">
              Request Dev Hub quote
            </Link>
          </div>
        </div>

        <div className="mt-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Delivery strengths</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">Five disciplines moving together.</h3>
          <BouncingCircleField items={devHubStrengths} ariaLabel="King Sparkon software delivery strengths" variant="services" />
        </div>

        <div className="mt-14">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Engagement paths</p>
          <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] md:text-4xl">Start free, then build with confidence.</h3>
          <BouncingCircleField items={devHubStats} ariaLabel="King Sparkon Dev Hub engagement options" variant="stats" />
        </div>
      </div>
    </section>
  );
}
