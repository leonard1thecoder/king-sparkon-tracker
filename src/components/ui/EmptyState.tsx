import type { ReactNode } from "react";
import { Badge } from "./Badge";

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="border border-dashed border-[var(--line)] bg-white/35 p-8 text-center">
      <Badge>NO RECORDS</Badge>
      <h3 className="mt-4 font-mono text-xl font-bold uppercase tracking-[0.08em]">{title}</h3>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[var(--steel)]">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
