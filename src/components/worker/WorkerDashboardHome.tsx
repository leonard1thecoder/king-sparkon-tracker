"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BadgePercent, Loader2, PackageCheck, QrCode, ScanLine, ShoppingBag, Ticket, WalletCards } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Skeleton } from "@/components/ui/Skeleton";
import { normalizeApiError } from "@/lib/api/client";
import { getWorkerDashboard } from "@/lib/api/worker-dashboard";
import { KscWalletSection } from "@/components/ksc/KscWalletSection";
import type { WorkerDashboardStats } from "@/lib/types/backend";

export function WorkerDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkerDashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getWorkerDashboard()
      .then((dashboard) => {
        if (!cancelled) {
          setStats(dashboard);
          setError(null);
        }
      })
      .catch((exception) => {
        if (!cancelled) setError(normalizeApiError(exception).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="grid gap-4 p-4 md:p-5">
        <div className="h-20 animate-pulse rounded-[var(--radius-lg)] bg-slate-50" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="grid gap-4 p-4 md:p-5">
        <Card className="p-5 text-center">
          <p className="text-[0.8125rem] font-bold">Worker dashboard unavailable</p>
          <p className="mt-1 text-xs text-[var(--steel)]">{error}</p>
          <Link href="/dashboard/worker/scan" className="mt-4 inline-flex h-9 items-center justify-center rounded-[var(--radius-md)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white">Open counter checkout</Link>
        </Card>
      </div>
    );
  }

  const staffPercent = Number(stats?.staffDiscountPercentage ?? 0);
  const staffEnabled = Boolean(stats?.staffPriceEnabled) || staffPercent > 0;

  return (
    <div className="grid gap-4 p-4 md:p-5">
      <div className="flex flex-col gap-2.5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-[1.25rem] font-bold tracking-[-0.02em]">
            Hello, {stats?.username ?? "Worker"} 👋
          </h1>
          <p className="mt-1 text-[0.8125rem] leading-5 text-[var(--steel)]">
            {stats?.jobTitle ? `${stats.jobTitle} · ` : ""}{stats?.businessName ?? "Worker terminal"} — mall, tickets, counter and tips in one place.
          </p>
          {staffEnabled ? (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-[var(--signal)]/30 bg-[var(--signal-soft)] px-3 py-1 text-xs font-black text-[var(--signal-strong)]"><BadgePercent className="h-3.5 w-3.5" /> Staff price active · {staffPercent}% off mall sale prices</p>
          ) : (
            <p className="mt-2 text-xs font-bold text-[var(--muted)]">No staff discount set. Ask your owner to add a staff % to unlock staff price.</p>
          )}
        </div>
        <Link href="/dashboard/worker/scan" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--signal)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white shadow-[0_8px_20px_rgba(14,165,233,0.18)] hover:bg-[var(--signal-strong)]">
          Counter checkout <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Staff Mall" value={String(stats?.mallProductsAvailable ?? 0)} detail={staffEnabled ? `Buy at ${staffPercent}% staff price` : "Products available"} tone="signal" icon={<ShoppingBag className="h-5 w-5" />} />
        <MetricCard label="My Mall Orders" value={String(stats?.mallMyPurchases ?? 0)} detail="Your staff purchases" tone="confirm" icon={<PackageCheck className="h-5 w-5" />} />
        <MetricCard label="Ticket Events" value={String(stats?.ticketsUpcomingEvents ?? 0)} detail={`${stats?.ticketsMyTickets ?? 0} of your tickets`} tone="signal" icon={<Ticket className="h-5 w-5" />} />
        <MetricCard label="Counter Sales" value={String(stats?.transactionsHandled ?? 0)} detail={`${stats?.tipsReceived ?? 0} tips received`} tone="confirm" icon={<ScanLine className="h-5 w-5" />} />
      </div>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="p-6">
          <SectionHeader title="King Sparkon Mall" description={staffEnabled ? `Shop with ${staffPercent}% staff price` : "Shop the mall catalogue"} eyebrow="MALL" />
          <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Browse the same catalogue as customers. {staffEnabled ? "Your staff discount applies automatically at checkout and on every staff price tag." : "When your owner sets a staff %, your prices drop automatically."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/worker/mall" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white"><ShoppingBag className="h-4 w-4" /> Open staff mall</Link>
            <Link href="/dashboard/worker/orders" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-[0.8125rem] font-bold text-[var(--ink)]"><PackageCheck className="h-4 w-4" /> Online orders</Link>
          </div>
        </Card>
        <Card className="p-6">
          <SectionHeader title="King Sparkon Tickets" description="Events, gate scan and your tickets" eyebrow="TICKETS" />
          <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Browse events, keep your own tickets, and verify buyers at the gate.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href="/dashboard/worker/tickets" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] bg-[var(--signal)] px-4 text-[0.8125rem] font-bold text-white"><Ticket className="h-4 w-4" /> Browse tickets</Link>
            <Link href="/dashboard/worker/tickets/scan" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-[0.8125rem] font-bold text-[var(--ink)]"><QrCode className="h-4 w-4" /> Gate scan</Link>
            <Link href="/dashboard/worker/tips" className="inline-flex h-9 items-center justify-center gap-1.5 rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-[0.8125rem] font-bold text-[var(--ink)]"><WalletCards className="h-4 w-4" /> Tips</Link>
          </div>
        </Card>
      </section>

      <KscWalletSection
        title="Worker KSC Wallet"
        description="Coin for AI/MCP payments and King Sparkon services. Your tip earnings stay untouched in Tips & QR."
      />
    </div>
  );
}
