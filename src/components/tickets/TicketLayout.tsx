"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Barcode, Crown, QrCode, ShieldCheck, Ticket, UserRound } from "lucide-react";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { getTicketSession, setDemoTicketRole, ticketRoleOptions } from "@/services/ticketAuthService";
import type { TicketRole, TicketSession } from "@/types/tickets";

type TicketLayoutProps = {
  children: ReactNode;
};

const links = [
  { label: "Tickets", href: "/tickets", icon: Ticket },
  { label: "My Tickets", href: "/tickets/my-tickets", icon: UserRound },
  { label: "Scan Ticket", href: "/tickets/scan", icon: QrCode },
  { label: "Owner Tickets", href: "/tickets/owner", icon: Crown },
] as const;

export function TicketLayout({ children }: TicketLayoutProps) {
  const pathname = usePathname();
  const [session, setSession] = useState<TicketSession | null>(null);

  useEffect(() => {
    setSession(getTicketSession());
  }, []);

  function switchRole(role: TicketRole) {
    setSession(setDemoTicketRole(role));
  }

  return (
    <div className="min-h-screen bg-white text-[var(--ink)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-white/92 shadow-[0_18px_60px_rgba(7,17,31,0.08)] backdrop-blur-xl">
        <nav className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between" aria-label="Ticket navigation">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-3" aria-label="King Sparkon Tracker home">
              <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={46} height={46} className="rounded-[1.15rem] border border-[var(--line)] bg-white p-1 shadow-[var(--shadow-soft)]" priority />
              <div>
                <p className="font-mono text-[0.62rem] font-bold uppercase tracking-[0.18em] text-[var(--signal)]">Ticket QR operations</p>
                <p className="font-black uppercase tracking-[-0.02em]">King Sparkon Tracker</p>
              </div>
            </Link>
            <span className="hidden items-center gap-2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-[var(--steel)] sm:inline-flex">
              <Barcode className="h-3.5 w-3.5 text-[var(--signal)]" /> scan-first
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {links.map(({ label, href, icon: Icon }) => {
              const active = pathname === href || (href !== "/tickets" && pathname.startsWith(href));
              return (
                <Link key={href} href={href} className={`inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full border px-4 text-sm font-black ${active ? "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)]" : "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--signal)] hover:text-[var(--ink)]"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-[var(--line)] bg-[var(--surface)]/70">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 text-xs font-bold text-[var(--steel)] md:px-8 lg:flex-row lg:items-center lg:justify-between">
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[var(--confirm)]" /> Demo protected flow: backend auth TODO. Current role: <strong className="text-[var(--ink)]">{session?.roles.join(" + ") ?? "Loading"}</strong></span>
            <div className="flex flex-wrap gap-2">
              {ticketRoleOptions.map((role) => (
                <button key={role} type="button" onClick={() => switchRole(role)} className={`rounded-full border px-3 py-1.5 font-mono text-[0.66rem] font-black uppercase tracking-[0.12em] ${session?.roles.includes(role) ? "border-[var(--signal)] bg-white text-[var(--signal)]" : "border-[var(--line)] bg-white/70 text-[var(--steel)] hover:border-[var(--signal)]"}`}>
                  {role}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {children}
      <SiteFooter />
    </div>
  );
}
