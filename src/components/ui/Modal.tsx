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
        className="w-full max-w-xl overflow-hidden rounded-xl border border-[var(--line-strong)] bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--line)] bg-white px-5 py-4">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--signal)]">King Sparkon</p>
            <h2 id="modal-title" className="mt-1 text-xl font-extrabold tracking-[-0.03em] text-[var(--ink)]">{title}</h2>
          </div>
          <Button variant="quiet" onClick={onClose} aria-label="Close dialog" className="h-10 min-h-10 w-10 px-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="bg-white p-5">{children}</div>
      </div>
    </div>
  );
}
