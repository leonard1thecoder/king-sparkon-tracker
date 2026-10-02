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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/28 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={onClose}>
      <div
        className="w-full max-w-lg overflow-hidden rounded-[var(--radius-xl)] border border-[var(--line-strong)] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.14)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-[var(--line)] bg-white px-4 py-3">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[var(--signal)]">King Sparkon</p>
            <h2 id="modal-title" className="mt-1 text-[0.9375rem] font-semibold tracking-[-0.01em] text-[var(--ink)]">{title}</h2>
          </div>
          <Button variant="quiet" onClick={onClose} aria-label="Close dialog" className="h-8 min-h-8 w-8 px-0">
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
        <div className="bg-white p-4">{children}</div>
      </div>
    </div>
  );
}
