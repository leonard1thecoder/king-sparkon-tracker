import type { ReactNode } from "react";
import { Badge } from "./Badge";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-dashed border-[var(--line)] bg-white/50 p-6 text-center">
      <Badge>NO RECORDS</Badge>
      <h3 className="mt-3 font-mono text-sm font-bold uppercase tracking-[0.06em]">{title}</h3>
      <p className="mx-auto mt-2 max-w-lg text-[0.8125rem] leading-5 text-[var(--steel)]">{description}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  );
}
