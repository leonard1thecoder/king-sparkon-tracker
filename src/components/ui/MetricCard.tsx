import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "signal" | "confirm";
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] p-5 shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:border-[var(--line-strong)]">
      <div className="flex items-start justify-between gap-4">
        <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--steel)]">{label}</p>
        {icon ? <div className="grid h-10 w-10 place-items-center rounded-[var(--radius-md)] bg-[var(--paper)] text-[var(--signal)]">{icon}</div> : null}
      </div>
      <p
        className={cn(
          "money mt-4 text-3xl font-black tracking-tight md:text-4xl",
          tone === "signal" && "text-[var(--signal)]",
          tone === "confirm" && "text-[var(--confirm)]",
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{detail}</p> : null}
    </div>
  );
}
