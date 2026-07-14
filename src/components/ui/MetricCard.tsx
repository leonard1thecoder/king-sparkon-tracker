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
    <div className="group relative overflow-hidden rounded-xl border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] transition duration-200 ease-out hover:border-[var(--line-strong)]">
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-[var(--steel)]">{label}</p>
        {icon ? <div className="grid h-10 w-10 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--signal)] transition group-hover:border-[var(--line-strong)]">{icon}</div> : null}
      </div>
      <p className={cn("money mt-4 text-3xl font-black tracking-tight md:text-4xl", tone === "signal" && "text-[var(--signal-strong)]", tone === "confirm" && "text-[var(--signal-strong)]")}>{value}</p>
      {detail ? <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{detail}</p> : null}
    </div>
  );
}
