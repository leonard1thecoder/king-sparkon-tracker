"use client";

import { cn } from "@/lib/utils/cn";
import type { ArtistBookingStatus } from "@/types/artist";

const statusConfig: Record<ArtistBookingStatus, { label: string; className: string; dot?: string }> = {
  PENDING: {
    label: "● Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  ACCEPTED: {
    label: "✓ Accepted",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  CONFIRMED: {
    label: "✓ Confirmed",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "× Rejected",
    className: "border-red-200 bg-red-50 text-red-600",
  },
};

export function ArtistStatusBadge({ status }: { status: ArtistBookingStatus }) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.08em]",
        cfg.className
      )}
    >
      {cfg.label}
    </span>
  );
}

export function BookingFeeBadge({ amount }: { amount: number }) {
  const formatted = new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--signal-soft)] px-3 py-1 text-xs font-black text-[var(--signal-strong)]">
      {formatted}
    </span>
  );
}

export function ArtistTypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--line-strong)] bg-white px-2.5 py-1 text-[0.68rem] font-black uppercase tracking-[0.1em] text-[var(--ink)]">
      {type}
    </span>
  );
}
