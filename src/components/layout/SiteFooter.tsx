"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Barcode, Mail, MapPin, ShieldCheck } from "lucide-react";
import { SocialLinks } from "@/components/social/SocialLinks";
import { SOCIAL_LINKS } from "@/lib/config/social-links";

type SiteFooterProps = {
  marketingOnly?: boolean;
};

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Tickets", href: "/tickets" },
      { label: "Affiliate Program", href: "/#affiliate" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Contact", href: "/#contact" },
    ],
  },
  {
    title: "Ticket Access",
    links: [
      { label: "Login", href: "/login" },
      { label: "Register Business", href: "/register" },
      { label: "My Tickets", href: "/tickets/my-tickets" },
      { label: "Scan Ticket", href: "/tickets/scan" },
    ],
  },
  {
    title: "Operations",
    links: [
      { label: "Owner Dashboard", href: "/dashboard/owner" },
      { label: "Owner Tickets", href: "/tickets/owner" },
      { label: "Create Event", href: "/tickets/owner/create" },
      { label: "Scan Verification", href: "/dashboard/worker/scan" },
    ],
  },
] as const;

export function SiteFooter({ marketingOnly = false }: SiteFooterProps) {
  const pathname = usePathname();

  if (marketingOnly && pathname !== "/") {
    return null;
  }

  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-[var(--ink)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-[var(--gold)]/10 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-4rem] h-96 w-96 rounded-full bg-[var(--signal)]/10 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-[88%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--gold)]/40 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 py-14 md:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_1.35fr] lg:items-start">
          <div className="max-w-xl">
            <Link href="/" aria-label="King Sparkon Tracker home" className="inline-flex items-center gap-3">
              <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={58} height={58} className="rounded-[1.35rem] border border-white/12 bg-white/[0.06] p-1.5 shadow-[var(--shadow-soft)]" />
              <div>
                <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.2em] text-[var(--gold)]">Barcode operations</p>
                <p className="text-xl font-black uppercase tracking-[-0.04em] text-white">King Sparkon Tracker</p>
              </div>
            </Link>

            <p className="mt-6 text-sm leading-7 text-white/62 md:text-base">
              Professional barcode inventory and QR ticket software for scanning, event entry, stock movement, worker tips, affiliate growth, payments, promotions, and audit-ready reports.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/tickets" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)]">
                Explore tickets <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/14 px-5 text-sm font-black text-white/78 hover:border-white/35 hover:bg-white/[0.06] hover:text-white">
                Login terminal
              </Link>
            </div>

            <div className="mt-8">
              <p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.18em] text-white/42">Social profiles</p>
              <SocialLinks variant="dark" />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title} className="rounded-[1.65rem] border border-white/10 bg-white/[0.045] p-5 shadow-[var(--shadow-soft)] backdrop-blur">
                <h2 className="font-mono text-[0.7rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">{group.title}</h2>
                <ul className="mt-5 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm font-bold text-white/62 hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-5 shadow-[var(--shadow-soft)] md:grid-cols-3">
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--gold)]/12 text-[var(--gold)]"><Barcode className="h-5 w-5" /></div>
            <div><p className="text-sm font-black text-white">Scan-first tracking</p><p className="mt-1 text-xs leading-5 text-white/52">Barcode and QR flows for owners, workers, buyers, affiliates, and admins.</p></div>
          </div>
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--signal)]/12 text-[var(--signal)]"><ShieldCheck className="h-5 w-5" /></div>
            <div><p className="text-sm font-black text-white">QR ticket verification</p><p className="mt-1 text-xs leading-5 text-white/52">Event capacity, ticket status, class sales, and gate entry verification.</p></div>
          </div>
          <div className="flex gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 text-white"><Mail className="h-5 w-5" /></div>
            <div><p className="text-sm font-black text-white">Need a production rollout?</p><Link href="/#contact" className="mt-1 inline-flex text-xs font-bold text-[var(--gold)] hover:text-white">Send implementation inquiry</Link></div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs font-semibold text-white/44 md:flex-row md:items-center md:justify-between">
          <p>© {year} King Sparkon Tracker. Built for serious barcode and ticket operations.</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> South Africa ready</span>
            <span className="hidden h-1 w-1 rounded-full bg-white/24 md:inline-flex" />
            <Link href={SOCIAL_LINKS.find((social) => social.platform === "GitHub")?.href ?? "https://github.com/leonard1thecoder"} target="_blank" rel="noreferrer" className="hover:text-white">GitHub profile only</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
