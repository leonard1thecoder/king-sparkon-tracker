import { cn } from "@/lib/utils/cn";

export function MetricCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: string;
  detail?: string;
  tone?: "neutral" | "signal" | "confirm";
}) {
  return (
    <div className="border border-[var(--line)] bg-white/50 p-5">
      <p className="font-mono text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[var(--steel)]">{label}</p>
      <p
        className={cn(
          "money mt-3 text-3xl font-black tracking-tight",
          tone === "signal" && "text-[var(--signal)]",
          tone === "confirm" && "text-[var(--confirm)]",
        )}
      >
        {value}
      </p>
      {detail ? <p className="mt-2 text-sm text-[var(--steel)]">{detail}</p> : null}
    </div>
  );
}
