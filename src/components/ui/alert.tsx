import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Alert({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-lg border border-[var(--line)] bg-[var(--signal-soft)] px-4 py-3 text-sm leading-6 text-[var(--ink)]", className)} {...props} />;
}
