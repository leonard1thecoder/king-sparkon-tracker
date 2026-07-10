import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--surface-strong)] shadow-[var(--shadow-soft)] ring-1 ring-white/70 transition duration-200 ease-out hover:border-[var(--gold)]/70 hover:shadow-[var(--shadow-ledger)]", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-[var(--line)] bg-[var(--surface)]/55 px-5 py-4", className)} {...props} />;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-base font-black tracking-[-0.02em] text-[var(--ink)]", className)}>{children}</h2>;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}
