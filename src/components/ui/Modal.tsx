import type { ReactNode } from "react";
import { Button } from "./Button";

export function Modal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/70 p-4">
      <div className="w-full max-w-xl border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-ledger)]">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 className="font-mono text-sm font-bold uppercase tracking-[0.1em]">{title}</h2>
          <Button variant="quiet" onClick={onClose}>Close</Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
