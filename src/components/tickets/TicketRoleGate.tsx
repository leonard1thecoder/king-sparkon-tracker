"use client";

import Link from "next/link";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { getTicketSession, setDemoTicketRole, userHasTicketRole } from "@/services/ticketAuthService";
import type { TicketRole, TicketSession } from "@/types/tickets";

type TicketRoleGateProps = {
  allowedRoles: TicketRole[];
  title: string;
  description: string;
  children: ReactNode;
};

export function TicketRoleGate({ allowedRoles, title, description, children }: TicketRoleGateProps) {
  const [session, setSession] = useState<TicketSession | null>(null);

  useEffect(() => {
    setSession(getTicketSession());
  }, []);

  if (!session) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-20 md:px-8">
        <div className="rounded-[2rem] border border-[var(--line)] bg-white p-8 text-center shadow-[var(--shadow-soft)]">
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--muted)]">Checking ticket session</p>
          <h1 className="mt-3 text-3xl font-black tracking-[-0.04em]">Loading protected portal...</h1>
        </div>
      </div>
    );
  }

  if (userHasTicketRole(session, allowedRoles)) return <>{children}</>;

  return (
    <main className="mx-auto max-w-5xl px-5 py-16 md:px-8 lg:py-24">
      <section className="overflow-hidden rounded-[2.4rem] border border-[var(--line)] bg-white shadow-[var(--shadow-ledger)]">
        <div className="grid gap-0 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="bg-[var(--ink)] p-8 text-white md:p-10">
            <div className="grid h-14 w-14 place-items-center rounded-[1.25rem] bg-[var(--gold)]/12 text-[var(--gold)]">
              <LockKeyhole className="h-6 w-6" />
            </div>
            <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">Protected ticket route</p>
            <h1 className="mt-4 text-4xl font-black leading-[0.98] tracking-[-0.06em] md:text-5xl">{title}</h1>
            <p className="mt-5 text-sm leading-7 text-white/68">{description}</p>
            <div className="barcode-rule mt-8 text-white" />
          </div>
          <div className="p-6 md:p-8">
            <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5">
              <div className="flex gap-3">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--signal)]" />
                <div>
                  <h2 className="text-xl font-black tracking-[-0.03em]">Backend authorization is ready to plug in.</h2>
                  <p className="mt-2 text-sm font-semibold leading-6 text-[var(--steel)]">
                    Current demo role: <strong className="text-[var(--ink)]">{session.roles.join(" + ")}</strong>. Allowed roles: <strong className="text-[var(--ink)]">{allowedRoles.join(", ")}</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {allowedRoles.map((role) => (
                <button key={role} type="button" onClick={() => setSession(setDemoTicketRole(role))} className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
                  Switch demo to {role}
                </button>
              ))}
              <Link href="/tickets" className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--signal)]">
                Back to public tickets
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
