"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin } from "lucide-react";
import { CookieSettingsButton } from "@/components/cookie-consent/CookieSettingsButton";
import { SocialLinks } from "@/components/social/SocialLinks";
import { SOCIAL_LINKS } from "@/lib/config/social-links";

type SiteFooterProps = { marketingOnly?: boolean };

const footerGroups = [
  {
    title: "Worlds",
    links: [
      { label: "Users", href: "/users" },
      { label: "Artists", href: "/artists" },
      { label: "Businesses", href: "/businesses" },
      { label: "Workers", href: "/workers" },
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
      <div className="mx-auto max-w-7xl px-5 py-[30px] md:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="max-w-xl">
            <Link href="/" aria-label="King Sparkon home" className="inline-flex items-center gap-3">
              <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={240} height={106} className="object-contain" />
            </Link>
            <div className="mt-6"><p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[var(--steel)]">Social profiles</p><SocialLinks variant="light" /></div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {footerGroups.map((group) => <div key={group.title} className="border-l-2 border-[var(--premium-violet)]/50 pl-5"><h2 className="text-[0.72rem] font-extrabold uppercase tracking-[0.12em] text-[var(--premium-gold)]">{group.title}</h2><ul className="mt-5 space-y-3">{group.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm font-semibold text-[var(--steel)] transition-colors duration-200 hover:text-[var(--premium-cyan)]">{link.label}</Link></li>)}</ul></div>)}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-6 text-xs font-semibold text-[var(--muted)] md:flex-row md:items-center md:justify-between">
          <p>&copy; {year} King Sparkon. Trademark platform of Sizolwakhe Leonard Mthimunye.</p>
          <div className="flex flex-wrap items-center gap-3"><span className="inline-flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> South Africa ready</span><CookieSettingsButton variant="footer" /><Link href={SOCIAL_LINKS.find((social) => social.platform === "GitHub")?.href ?? "https://github.com/leonard1thecoder"} target="_blank" rel="noreferrer" className="hover:text-[var(--accent-hover)] transition-colors duration-200">GitHub profile</Link></div>
        </div>
      </div>
    </footer>
  );
}
