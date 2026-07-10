import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("table-ledger text-sm", className)} {...props} />;
}

export function TableWrap({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-x-auto rounded-[var(--radius-xl)] border border-[var(--line)] bg-white/72 shadow-[var(--shadow-soft)] ring-1 ring-white/70", className)} {...props} />;
}
