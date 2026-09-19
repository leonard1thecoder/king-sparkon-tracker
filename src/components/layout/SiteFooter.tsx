"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Barcode, Mail, MapPin, ShieldCheck } from "lucide-react";
import { CookieSettingsButton } from "@/components/cookie-consent/CookieSettingsButton";
import { SocialLinks } from "@/components/social/SocialLinks";
import { SOCIAL_LINKS } from "@/lib/config/social-links";

type SiteFooterProps = { marketingOnly?: boolean };

const footerGroups = [
  {
    title: "Platform",
    links: [
      { label: "How it works", href: "/how-it-works" },
      { label: "Features", href: "/features" },
      { label: "Guides", href: "/guides" },
      { label: "Articles", href: "/articles" },
      { label: "Jobs", href: "/jobs" },
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Barcode Inventory Guide", href: "/guides/barcode-inventory-guide" },
      { label: "QR Ticket Operations", href: "/guides/qr-ticket-operations" },
      { label: "Worker Tips & Payouts", href: "/guides/worker-tips-payouts" },
      { label: "Affiliate Referrals", href: "/guides/affiliate-referrals" },
      { label: "Dev Hub", href: "/dev-hub" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Login", href: "/login" },
      { label: "Register Business", href: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" },
    ],
  },
] as const;

export function SiteFooter({ marketingOnly = false }: SiteFooterProps) {
  const pathname = usePathname();
  if (pathname?.startsWith("/dashboard")) return null;
  if (pathname?.startsWith("/login") || pathname?.startsWith("/register") || pathname?.startsWith("/forgot-password") || pathname?.startsWith("/reset-password") || pathname?.startsWith("/verify-email") || pathname?.startsWith("/resend-verification")) return null;
  if (marketingOnly && pathname !== "/") return null;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--line-strong)] bg-black text-[var(--ink)]">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="max-w-xl">
            <Link href="/" aria-label="King Sparkon home" className="inline-flex items-center gap-3">
              <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={240} height={106} className="object-contain" />
            </Link>
            <p className="mt-6 text-sm leading-7 text-[var(--steel)] md:text-base">Barcode inventory, QR tickets, jobs, affiliate marketing, Dev Hub software delivery, QA, cloud operations and audit-ready reports in one role-safe platform.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link data-orange-hover="true" href="/dashboard/user/tickets/buy" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-md)] border border-transparent bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 px-5 text-sm font-extrabold text-white transition-all duration-200 hover:from-yellow-300 hover:via-pink-500 hover:to-cyan-400 hover:text-black hover:shadow-[0_10px_28px_rgba(236,72,153,0.4)]">Buy tickets <ArrowRight className="h-4 w-4" /></Link>
              <Link data-orange-hover="true" href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE" className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-[#0d0d1c] px-5 text-sm font-extrabold text-[var(--ink)] transition-all duration-200 hover:border-[var(--premium-gold)] hover:text-[var(--premium-gold)] hover:shadow-[0_8px_22px_rgba(250,204,21,0.22)]">Create business account</Link>
            </div>
            <div className="mt-8"><p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[var(--steel)]">Social profiles</p><SocialLinks variant="light" /></div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {footerGroups.map((group) => <div key={group.title} className="border-l-2 border-[var(--premium-violet)]/50 pl-5"><h2 className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--premium-gold)]">{group.title}</h2><ul className="mt-5 space-y-3">{group.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm font-semibold text-[var(--steel)] transition-colors duration-200 hover:text-[var(--premium-cyan)]">{link.label}</Link></li>)}</ul></div>)}
          </div>
        </div>

        <div className="mt-10 grid gap-4 border-y border-[var(--line)] py-6 md:grid-cols-3">
          <div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] text-[var(--signal)]"><Barcode className="h-5 w-5" /></div><div><p className="text-sm font-extrabold">Scan-first tracking</p><p className="mt-1 text-xs leading-5 text-[var(--steel)]">Barcode and QR flows for every platform role.</p></div></div>
          <div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] text-[var(--signal)]"><ShieldCheck className="h-5 w-5" /></div><div><p className="text-sm font-extrabold">Production discipline</p><p className="mt-1 text-xs leading-5 text-[var(--steel)]">Software delivery, QA, cloud maintenance and support.</p></div></div>
          <div className="flex gap-3"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-[var(--radius-md)] border border-[var(--line)] text-[var(--signal)]"><Mail className="h-5 w-5" /></div><div><p className="text-sm font-extrabold">Planning a rollout?</p><Link href="/#contact" className="mt-1 inline-flex text-xs font-bold text-[var(--signal-strong)] hover:text-[var(--accent-hover)] transition-colors duration-200">Send an implementation inquiry</Link></div></div>
        </div>

        <div className="mt-6 flex flex-col gap-4 text-xs font-semibold text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} King Sparkon. Trademark platform of Sizolwakhe Leonard Mthimunye.</p>
          <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> South Africa ready</span><CookieSettingsButton variant="footer" /><Link href={SOCIAL_LINKS.find((social) => social.platform === "GitHub")?.href ?? "https://github.com/leonard1thecoder"} target="_blank" rel="noreferrer" className="hover:text-[var(--accent-hover)] transition-colors duration-200">GitHub profile</Link></div>
        </div>
      </div>
    </footer>
  );
}
