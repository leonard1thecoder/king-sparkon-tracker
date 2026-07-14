import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("inline-flex items-center gap-1 rounded-md border border-[var(--line)] bg-[var(--signal-soft)] px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[var(--signal-strong)]", className)} {...props} />;
}
