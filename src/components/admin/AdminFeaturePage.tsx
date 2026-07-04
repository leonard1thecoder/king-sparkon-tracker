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
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <section className="overflow-hidden rounded-[2.5rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
          <div className="grid gap-8 bg-[var(--ink)] p-6 text-white enterprise-grid md:p-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{eyebrow}</p>
              <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] md:text-6xl">{title}</h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-white/68 md:text-base">{description}</p>
            </div>
            <div className="grid h-16 w-16 place-items-center rounded-[1.5rem] border border-white/10 bg-white/[0.08] text-[var(--gold)] shadow-[var(--shadow-soft)]">
              <Icon className="h-8 w-8" />
            </div>
          </div>

          <div className="grid gap-5 p-5 md:p-7 lg:grid-cols-[0.85fr_1.15fr]">
            <aside className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5">
              <ShieldCheck className="h-6 w-6 text-[var(--signal)]" />
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">Admin feature shell is ready.</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--steel)]">This workspace keeps the admin navigation, production spacing, empty state guidance, and live-data expectations visible while each feature area is expanded.</p>
              {primaryHref && primaryLabel ? (
                <Link href={primaryHref} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                  {primaryLabel} <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </aside>

            <div className="grid gap-4 md:grid-cols-2">
              {modules.map((module) => (
                <article key={module.title} className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
                  <CheckCircle2 className="h-5 w-5 text-[var(--signal)]" />
                  <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{module.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{module.description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
