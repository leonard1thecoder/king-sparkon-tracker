import { cn } from "@/lib/utils/cn";

type Tone = "neutral" | "signal" | "confirm" | "warning";

const tones: Record<Tone, string> = {
  neutral: "border-[var(--line)] text-[var(--steel)]",
  signal: "border-[var(--signal)] text-[var(--signal)]",
  confirm: "border-[var(--confirm)] text-[var(--confirm)]",
  warning: "border-amber-600 text-amber-700",
};

export function StatusPill({ label, tone = "neutral", className }: { label: string; tone?: Tone; className?: string }) {
  return <span className={cn("stamp-tag inline-flex px-2.5 py-1 text-[0.68rem] font-bold", tones[tone], className)}>{label}</span>;
}
