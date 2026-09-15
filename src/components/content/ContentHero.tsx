import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

export function ContentHero({
  eyebrow,
  title,
  description,
  meta,
  actions,
  visual,
}: {
  eyebrow: string;
  title: string;
  description: string;
  meta?: ReactNode;
  actions?: ReactNode;
  visual?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--signal-soft)] via-[var(--surface)] to-[var(--surface)]" aria-hidden="true" />
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-[var(--signal)]/5 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-sky-200/20 blur-3xl" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-8 px-5 py-10 md:px-8 md:py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <p className="inline-flex items-center rounded-full border border-[var(--signal)]/20 bg-[var(--signal-soft)] px-3 py-1 text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[var(--ink)] md:text-5xl lg:text-[3.25rem] lg:leading-[0.95]">{title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--steel)] md:text-lg md:leading-8">{description}</p>
          {meta ? <div className="mt-5 flex flex-wrap gap-2">{meta}</div> : null}
          {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
        {visual ? (
          <GlassCard variant="elevated" className="relative overflow-hidden">
            {visual}
          </GlassCard>
        ) : null}
      </div>
    </div>
  );
}
