import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-[var(--radius-sm)] border border-cyan-300/25 bg-[var(--signal-soft)] px-1.5 py-0.5 text-[0.6875rem] font-bold uppercase tracking-[0.06em] text-[var(--signal-strong)] transition-colors hover:border-yellow-300/45 hover:text-[var(--premium-gold)]", className)} {...props} />;
}
