import type { Metadata } from "next";
import { DashboardHeader } from "@/components/layout/DashboardHeader";

export const metadata: Metadata = {
  title: "Platform Access",
  description: "Every business owner has free, full platform access.",
};

export default function OwnerBillingPage() {
  return (
    <>
      <DashboardHeader role="OWNER" title="Platform access" description="All business features are available without a trial, subscription, or recurring fee." />
      <main className="grid gap-6 p-5 md:p-8">
        <section className="rounded-xl border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-soft)] md:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">Free access</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">Your business has full access.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--steel)]">There are no monthly or yearly plans to manage. Continue using inventory, workers, tickets, transactions, reports, and the rest of the platform.</p>
        </section>
      </main>
    </>
  );
}
