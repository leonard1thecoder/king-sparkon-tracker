import type { ReactNode } from "react";
import { X } from "lucide-react";
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
    <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--ink)]/70 p-4 backdrop-blur-sm" role="presentation">
      <div className="w-full max-w-xl overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line)] bg-[var(--paper)] shadow-[var(--shadow-ledger)]" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="flex items-center justify-between border-b border-[var(--line)] px-5 py-4">
          <h2 id="modal-title" className="font-mono text-sm font-bold uppercase tracking-[0.1em]">{title}</h2>
          <Button variant="quiet" onClick={onClose} aria-label="Close dialog" className="h-10 min-h-10 w-10 px-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
