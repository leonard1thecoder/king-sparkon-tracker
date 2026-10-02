import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Table({ className, ...props }: HTMLAttributes<HTMLTableElement>) {
  return <table className={cn("table-ledger text-[0.8125rem]", className)} {...props} />;
}

export function TableWrap({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("max-w-full overflow-x-auto overscroll-x-contain rounded-[var(--radius-lg)] border border-[var(--line)] bg-[#08080f] text-[var(--ink)] shadow-none [scrollbar-color:var(--signal)_transparent] [scrollbar-width:thin]", className)} {...props} />;
}
