import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "signal" | "confirm" | "warning" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-[var(--line-strong)] bg-[var(--paper)] text-[var(--steel)]",
  signal: "border-[var(--signal)] bg-[rgba(29,92,131,0.08)] text-[var(--signal)]",
  confirm: "border-[var(--confirm)] bg-[rgba(50,213,131,0.12)] text-[var(--confirm)]",
  warning: "border-[var(--warning)] bg-[rgba(245,158,11,0.1)] text-[var(--warning)]",
  danger: "border-[var(--danger)] bg-[rgba(220,38,38,0.08)] text-[var(--danger)]",
};

export function StatusPill({ label, tone = "neutral", className }: { label: string; tone?: Tone; className?: string }) {
  return <span className={cn("stamp-tag inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold", tones[tone], className)}>{label}</span>;
}
