import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[#0a0a14] text-[var(--ink)] shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-fuchsia-400/50 hover:shadow-[0_10px_32px_rgba(236,72,153,0.22),0_6px_18px_rgba(34,211,238,0.16)]", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-b border-[var(--line)] bg-[#0d0d1c] px-6 py-4", className)} {...props} />;
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn("text-base font-extrabold tracking-[-0.02em] text-[var(--ink)]", className)}>{children}</h2>;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("bg-[#0a0a14] p-6 text-[var(--ink)]", className)} {...props} />;
}
