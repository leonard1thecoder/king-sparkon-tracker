import type { ReactNode } from "react";

export function MobileDashboardNav({ children }: { children: ReactNode }) {
  return <div className="grid gap-2 border-b border-[var(--line)] bg-[var(--paper)] p-3 lg:hidden">{children}</div>;
}
