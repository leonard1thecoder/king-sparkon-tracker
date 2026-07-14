"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Barcode, Mail, MapPin, ShieldCheck } from "lucide-react";
import { SocialLinks } from "@/components/social/SocialLinks";
import { SOCIAL_LINKS } from "@/lib/config/social-links";

type SiteFooterProps = { marketingOnly?: boolean };

const footerGroups = [
  { title: "Platform", links: [{ label: "Features", href: "/#features" }, { label: "Jobs", href: "/#jobs" }, { label: "Affiliate Program", href: "/#affiliate" }, { label: "Dev Hub", href: "/#dev-hub" }, { label: "Pricing", href: "/#pricing" }, { label: "Contact", href: "/#contact" }] },
  { title: "Access", links: [{ label: "Login", href: "/login" }, { label: "Register Business", href: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" }, { label: "Buy Tickets", href: "/dashboard/user/tickets/buy" }, { label: "My Tickets", href: "/dashboard/user/tickets" }, { label: "Scan Ticket", href: "/dashboard/worker/tickets/scan" }] },
  { title: "Operations", links: [{ label: "Owner Dashboard", href: "/dashboard/owner" }, { label: "Owner Tickets", href: "/dashboard/owner/tickets" }, { label: "Create Event", href: "/dashboard/owner/tickets/create" }, { label: "Scan Verification", href: "/dashboard/worker/tickets/scan" }] },
] as const;

export function SiteFooter({ marketingOnly = false }: SiteFooterProps) {
  const pathname = usePathname();
  if (marketingOnly && pathname !== "/") return null;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line)] bg-white text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="max-w-xl">
            <Link href="/" aria-label="King Sparkon Tracker home" className="inline-flex items-center gap-3">
              <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker trademark barcode logo" width={56} height={56} className="rounded-lg border border-[var(--line)] bg-white p-1.5" />
              <div><p className="text-[0.66rem] font-extrabold uppercase tracking-[0.16em] text-[var(--signal-strong)]">Trademark platform</p><p className="text-xl font-black tracking-[-0.04em]">King Sparkon Tracker™</p></div>
            </Link>
            <p className="mt-6 text-sm leading-7 text-[var(--steel)] md:text-base">Barcode inventory, QR tickets, jobs, affiliate marketing, Dev Hub software delivery, QA, cloud operations and audit-ready reports in one role-safe platform.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link data-orange-hover="true" href="/dashboard/user/tickets/buy" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--accent-hover)]">Buy tickets <ArrowRight className="h-4 w-4" /></Link>
              <Link data-orange-hover="true" href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--line-strong)] bg-white px-5 text-sm font-extrabold text-[var(--ink)] hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white">Start 14-day trial</Link>
            </div>
            <div className="mt-8"><p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[var(--steel)]">Social profiles</p><SocialLinks variant="light" /></div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {footerGroups.map((group) => <div key={group.title} className="border-l-2 border-[var(--line)] pl-5"><h2 className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--signal-strong)]">{group.title}</h2><ul className="mt-5 space-y-3">{group.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm font-semibold text-[var(--steel)] hover:text-[var(--accent-hover)]">{link.label}</Link></li>)}</ul></div>)}
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-y border-[var(--line)] py-6 md:grid-cols-3">
          <div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--line)] text-[var(--signal)]"><Barcode className="h-5 w-5" /></div><div><p className="text-sm font-extrabold">Scan-first tracking</p><p className="mt-1 text-xs leading-5 text-[var(--steel)]">Barcode and QR flows for every platform role.</p></div></div>
          <div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--line)] text-[var(--signal)]"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-sm font-extrabold">Production discipline</p><p className="mt-1 text-xs leading-5 text-[var(--steel)]">Software delivery, QA, cloud maintenance and support.</p></div></div>
          <div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--line)] text-[var(--signal)]"><Mail className="h-5 w-5" /></div><div><p className="text-sm font-extrabold">Planning a rollout?</p><Link href="/#contact" className="mt-1 inline-flex text-xs font-bold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">Send an implementation inquiry</Link></div></div>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-xs font-semibold text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>© {year} King Sparkon Tracker™. Trademark platform of Sizolwakhe Leonard Mthimunye.</p>
          <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> South Africa ready</span><Link href={SOCIAL_LINKS.find((social) => social.platform === "GitHub")?.href ?? "https://github.com/leonard1thecoder"} target="_blank" rel="noreferrer" className="hover:text-[var(--accent-hover)]">GitHub profile</Link></div>
        </div>
      </div>
    </footer>
  );
}
