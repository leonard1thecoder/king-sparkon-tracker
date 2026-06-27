import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "signal" | "confirm" | "warning";

const tones: Record<Tone, string> = {
  neutral: "border-[var(--line-strong)] bg-[var(--paper)] text-[var(--steel)]",
  signal: "border-[var(--signal)] bg-[rgba(242,100,42,0.08)] text-[var(--signal)]",
  confirm: "border-[var(--confirm)] bg-[rgba(21,128,61,0.08)] text-[var(--confirm)]",
  warning: "border-[var(--warning)] bg-[rgba(183,121,31,0.08)] text-[var(--warning)]",
};

export function StatusPill({ label, tone = "neutral", className }: { label: string; tone?: Tone; className?: string }) {
  return <span className={cn("stamp-tag inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-bold", tones[tone], className)}>{label}</span>;
}
