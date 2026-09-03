import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-cyan-300/25 bg-[var(--signal-soft)] px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[var(--signal-strong)] transition-colors hover:border-yellow-300/45 hover:text-[var(--premium-gold)]", className)} {...props} />;
}
