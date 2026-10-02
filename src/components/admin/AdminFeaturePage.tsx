import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";

export type AdminFeaturePageProps = {
  eyebrow: string;
  title: string;
  description: string;
  icon: LucideIcon;
  modules: Array<{
    title: string;
    description: string;
  }>;
  primaryHref?: string;
  primaryLabel?: string;
};

export function AdminFeaturePage({ eyebrow, title, description, icon: Icon, modules, primaryHref, primaryLabel }: AdminFeaturePageProps) {
  return (
    <DashboardFrame role="Admin" nav={<DashboardRoleNav role="Admin" />}>
      <main className="grid gap-4 bg-[var(--surface)] p-4 md:p-5">
        <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
          <div className="grid gap-4 bg-[var(--ink)] p-4 text-white enterprise-grid lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--gold)]">{eyebrow}</p>
              <h1 className="mt-2 text-[1.5rem] font-bold tracking-[-0.02em]">{title}</h1>
              <p className="mt-2 max-w-3xl text-[0.8125rem] leading-5 text-white/68">{description}</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-[var(--radius-md)] border border-white/10 bg-white/[0.08] text-[var(--gold)] shadow-[var(--shadow-soft)]">
              <Icon className="h-5 w-5" />
            </div>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
              <ShieldCheck className="h-5 w-5 text-[var(--signal)]" />
              <h2 className="mt-3 text-[0.9375rem] font-bold tracking-[-0.01em]">Admin feature shell is ready.</h2>
              <p className="mt-1.5 text-[0.8125rem] leading-5 text-[var(--steel)]">This workspace keeps the admin navigation, production spacing, empty state guidance, and live-data expectations visible while each feature area is expanded.</p>
              {primaryHref && primaryLabel ? (
                <Link href={primaryHref} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white hover:bg-[var(--ink)]">
                  {primaryLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </aside>

            <div className="grid gap-3 md:grid-cols-2">
              {modules.map((module) => (
                <article key={module.title} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
                  <CheckCircle2 className="h-4 w-4 text-[var(--signal)]" />
                  <h3 className="mt-3 text-[0.9375rem] font-bold tracking-[-0.01em]">{module.title}</h3>
                  <p className="mt-1.5 text-[0.8125rem] leading-5 text-[var(--steel)]">{module.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
