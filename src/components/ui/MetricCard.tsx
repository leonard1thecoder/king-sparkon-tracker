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
    <div className="group relative overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-white p-3.5 shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:shadow-[var(--shadow-ledger)] hover:border-[var(--line-strong)]">
      <div className="flex items-start justify-between gap-2.5">
        <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-[var(--steel)]">{label}</p>
        {icon ? <div className="grid h-8 w-8 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-white text-[var(--signal)] transition-colors duration-200 group-hover:border-[var(--line-strong)] group-hover:bg-[var(--signal-soft)] [&_svg]:h-4 [&_svg]:w-4">{icon}</div> : null}
      </div>
      <p className={cn("money mt-2 text-[1.375rem] font-bold leading-none tracking-tight", tone === "signal" && "text-[var(--signal-strong)]", tone === "confirm" && "text-[var(--signal-strong)]")}>{value}</p>
      {detail ? <p className="mt-1 text-xs leading-5 text-[var(--steel)]">{detail}</p> : null}
    </div>
  );
}
