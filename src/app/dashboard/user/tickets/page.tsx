import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, QrCode, Ticket } from "lucide-react";
import { DashboardFrame } from "@/components/layout/DashboardFrame";
import { DashboardRoleNav } from "@/components/layout/DashboardRoleNav";

export const metadata: Metadata = {
  title: "My Tickets | King Sparkon Tracker",
  description: "User dashboard entry point for ticket browsing and issued QR ticket access.",
};

export default function UserTicketsPage() {
  return (
    <DashboardFrame role="User" nav={<DashboardRoleNav role="User" />}>
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        <section className="rounded-[2.4rem] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-ledger)] md:p-8">
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">User tickets</p>
          <h1 className="mt-3 text-4xl font-black tracking-[-0.055em] md:text-6xl">Tickets stay visible for user accounts.</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)] md:text-base">This dashboard route keeps the left navigation visible while users access ticket browsing, issued QR tickets, and job opportunities from the same role-aware workspace.</p>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Link href="/tickets" className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
              <Ticket className="h-6 w-6 text-[var(--signal)]" />
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">Browse tickets</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--steel)]">Open the event ticket portal.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--signal)]">View events <ArrowRight className="h-4 w-4" /></span>
            </Link>
            <Link href="/tickets/scan" className="rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow-soft)] hover:border-[var(--gold)]">
              <QrCode className="h-6 w-6 text-[var(--signal)]" />
              <h2 className="mt-5 text-2xl font-black tracking-[-0.04em]">QR ticket tools</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--steel)]">Access QR ticket verification when your role allows scanning.</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-[var(--signal)]">Open scanner <ArrowRight className="h-4 w-4" /></span>
            </Link>
          </div>
        </section>
      </main>
    </DashboardFrame>
  );
}
