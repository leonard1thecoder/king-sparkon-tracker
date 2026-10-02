import type { LucideIcon } from "lucide-react";

type TicketStatsCardProps = {
  title: string;
  value: string | number;
  caption: string;
  icon: LucideIcon;
};

export function TicketStatsCard({ title, value, caption, icon: Icon }: TicketStatsCardProps) {
  return (
    <article className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-white p-3.5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between gap-2.5">
        <div>
          <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--muted)]">{title}</p>
          <p className="money mt-1.5 text-[1.375rem] font-bold tracking-tight text-[var(--ink)]">{value}</p>
        </div>
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-[var(--radius-md)] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-1.5 text-xs font-medium leading-5 text-[var(--steel)]">{caption}</p>
    </article>
  );
}
