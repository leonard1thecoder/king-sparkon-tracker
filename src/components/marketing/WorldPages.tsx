import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/content/Breadcrumbs";
import { PremiumHeader } from "@/components/marketing/PremiumHeader";

export type WorldMove = { icon: LucideIcon; title: string; copy: string };
export type WorldLink = { label: string; href: string };
export type WorldConfig = {
  eyebrow: string;
  title: string;
  energy: string;
  copy: string;
  moves: WorldMove[];
  entryLabel: string;
  entryHref: string;
  secondary: WorldLink[];
  others: WorldLink[];
};

export function WorldPage({ config }: { config: WorldConfig }) {
  return (
    <>
      <PremiumHeader />
      <main className="bg-white text-[var(--ink)]">
        <div className="mx-auto max-w-7xl px-5 pt-6 md:px-8">
          <Breadcrumbs items={[{ label: config.eyebrow }]} />
        </div>

        <section className="relative overflow-hidden bg-[#050508] text-white">
          <div className="enterprise-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
          <div className="relative mx-auto max-w-7xl px-5 py-10 md:px-8 lg:py-14">
            <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.2em] text-[var(--premium-gold)]">{config.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-[1.02] tracking-[-0.04em] text-white md:text-5xl">{config.title}</h1>
            <p className="mt-3 text-[0.9375rem] font-bold text-white/70">{config.energy}</p>
            <p className="mt-3 max-w-2xl text-[0.9375rem] leading-7 text-white/60">{config.copy}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href={config.entryHref}
                className="inline-flex h-10 items-center justify-center gap-1.5 rounded-lg border border-[var(--premium-gold)]/50 bg-[var(--premium-gold)]/10 px-5 text-[0.8125rem] font-extrabold text-[var(--premium-gold)] transition-colors duration-200 hover:bg-[var(--premium-gold)] hover:text-black motion-reduce:transition-none"
              >
                {config.entryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              {config.secondary.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="inline-flex h-10 items-center justify-center rounded-lg border border-white/15 bg-transparent px-5 text-[0.8125rem] font-bold text-white/70 hover:text-white"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-10 md:px-8 lg:py-14">
          <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-[var(--signal-strong)]">What you can do here</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {config.moves.map(({ icon: Icon, title, copy }) => (
              <article key={title} className="rounded-2xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
                <span className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--line)] bg-[var(--surface)] text-[var(--signal)]">
                  <Icon className="h-4 w-4" />
                </span>
                <h2 className="mt-3 text-[0.9375rem] font-bold text-[var(--ink)]">{title}</h2>
                <p className="mt-1.5 text-[0.8125rem] leading-5 text-[var(--steel)]">{copy}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-[var(--line)] pt-6">
            <Link href="/" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-bold text-[var(--steel)] hover:text-[var(--signal-strong)]">
              <ArrowLeft className="h-3.5 w-3.5" /> King Sparkon
            </Link>
            {config.others.map((world) => (
              <Link
                key={world.href}
                href={world.href}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--line)] bg-white px-3.5 py-2 text-[0.8125rem] font-bold text-[var(--ink)] hover:border-[var(--premium-cyan)]/50"
              >
                {world.label} <ArrowRight className="h-3.5 w-3.5 text-[var(--signal)]" />
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
