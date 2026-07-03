import Link from "next/link";
import { ArrowRight, BadgeCheck, CloudCog, Code2, GitBranch, ShieldCheck, Sparkles } from "lucide-react";

const devHubStats = [
  ["Free", "Software quote", "Scope the product, roadmap, cloud needs, and release path before the build starts."],
  ["CI/CD", "Continuous integration", "Build, test, deploy, and release with cleaner automation instead of manual chaos."],
  ["QA", "Lifetime quality support", "Regression thinking, negative/positive tests, release confidence, and product hardening."],
  ["Cloud", "Maintenance support", "Cloud maintenance, monitoring discipline, uptime thinking, and production readiness."],
] as const;

const devHubStrengths = [
  ["Software development", "Web apps, dashboards, portals, scanning flows, payment flows, and business tools."],
  ["Continuous integration development", "GitHub workflows, test gates, deployment flow, branch discipline, and release checks."],
  ["Quality assurance", "Unit tests, edge cases, negative paths, regression coverage, and user-flow validation."],
  ["Lifetime support", "Long-term product improvement, issue review, maintenance planning, and safer upgrades."],
  ["Cloud maintenance", "Backend uptime, cloud hosting discipline, environment checks, and support after launch."],
  ["Free quote", "Start with a clean quote before committing budget, timeline, or technical scope."],
] as const;

export function DevHubSection() {
  return (
    <section id="dev-hub" className="scroll-mt-28 px-5 py-16 md:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.75rem] border border-[var(--gold)]/45 bg-[var(--ink)] p-5 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-end">
          <div>
            <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--gold)]">06 / King Sparkon Dev Hub</p>
            <h2 className="mt-4 text-4xl font-black tracking-[-0.055em] md:text-6xl">Build software with the same discipline behind the platform.</h2>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
              We develop software, set up continuous integration, add quality assurance, give lifetime support, and maintain products in the cloud with a free quote first.
            </p>
          </div>

          <div className="rounded-[2rem] border border-[var(--gold)]/35 bg-white/[0.07] p-5 shadow-[0_30px_100px_rgba(0,0,0,0.34)] backdrop-blur-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/60 bg-[var(--gold)] px-4 py-2 font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-[var(--ink)] shadow-[var(--shadow-soft)]">
              <Sparkles className="h-4 w-4" /> King-Sparkon-Strengths
            </div>
            <p className="mt-5 text-2xl font-black tracking-[-0.04em]">Dev Hub is for businesses that need software built, tested, deployed, maintained, and improved properly.</p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--gold)] px-6 font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:bg-white">
                Start business free 14 trial <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard/owner/developer" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/12 bg-white/[0.07] px-6 font-bold text-white shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
                Request Dev Hub quote
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {devHubStats.map(([value, label, copy]) => (
            <article key={label} className="rounded-[1.85rem] border border-white/10 bg-white/[0.07] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.24)] backdrop-blur hover:-translate-y-1 hover:border-[var(--gold)]">
              <p className="font-mono text-4xl font-black tracking-[-0.08em] text-[var(--gold)]">{value}</p>
              <h3 className="mt-4 text-xl font-black tracking-[-0.03em] text-white">{label}</h3>
              <p className="mt-2 text-sm leading-6 text-white/64">{copy}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {devHubStrengths.map(([title, copy], index) => (
            <article key={title} className="rounded-[1.85rem] border border-white/10 bg-white/[0.055] p-5 text-white shadow-[0_22px_70px_rgba(0,0,0,0.22)] backdrop-blur hover:-translate-y-1 hover:border-[var(--gold)]">
              {index === 0 ? <Code2 className="h-6 w-6 text-[var(--gold)]" /> : index === 1 ? <GitBranch className="h-6 w-6 text-[var(--gold)]" /> : index === 2 ? <ShieldCheck className="h-6 w-6 text-[var(--gold)]" /> : index === 4 ? <CloudCog className="h-6 w-6 text-[var(--gold)]" /> : <BadgeCheck className="h-6 w-6 text-[var(--gold)]" />}
              <h3 className="mt-5 text-2xl font-black tracking-[-0.04em]">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-white/64">{copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
