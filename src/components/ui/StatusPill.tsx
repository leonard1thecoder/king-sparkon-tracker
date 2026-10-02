import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "signal" | "confirm" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-[var(--line)] bg-white text-[var(--steel)]",
  signal: "border-[var(--line-strong)] bg-[var(--signal-soft)] text-[var(--signal-strong)]",
  confirm: "border-[var(--line-strong)] bg-[var(--signal-soft)] text-[var(--signal-strong)]",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function StatusPill({ label, tone = "neutral", className }: { label: string; tone?: Tone; className?: string }) {
  return <span className={cn("inline-flex rounded-[var(--radius-sm)] border px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.05em]", tones[tone], className)}>{label}</span>;
}
