import type { LucideIcon } from "lucide-react";

type TicketStatsCardProps = {
  title: string;
  value: string | number;
  caption: string;
  icon: LucideIcon;
};

export function TicketStatsCard({ title, value, caption, icon: Icon }: TicketStatsCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">{title}</p>
          <p className="money mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--ink)]">{value}</p>
        </div>
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.15rem] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm font-semibold leading-6 text-[var(--steel)]">{caption}</p>
    </article>
  );
}
