import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "signal" | "confirm" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-[var(--line)] bg-white text-[var(--steel)]",
  signal: "border-[var(--line-strong)] bg-[var(--signal-soft)] text-[var(--signal-strong)]",
  confirm: "border-[var(--line-strong)] bg-[var(--signal-soft)] text-[var(--signal-strong)]",
  warning: "border-[var(--line-strong)] bg-[var(--signal-soft)] text-[var(--signal-strong)]",
  danger: "border-red-200 bg-red-50 text-red-700",
};

export function StatusPill({ label, tone = "neutral", className }: { label: string; tone?: Tone; className?: string }) {
  return <span className={cn("inline-flex rounded-md border px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.06em]", tones[tone], className)}>{label}</span>;
}
