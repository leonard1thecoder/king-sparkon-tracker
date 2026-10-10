import Link from "next/link";
import { CookieSettingsButton } from "@/components/cookie-consent/CookieSettingsButton";
import { SocialLinks } from "@/components/social/SocialLinks";

const groups = [
  {
    title: "Explore",
    links: [
      { label: "Events", href: "/events" },
      { label: "Mall", href: "/mall" },
      { label: "Job Posts", href: "/jobs" },
      { label: "Unemployment Insurance Fund", href: "/jobs/unemployment-insurance-fund" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: "/login" },
      { label: "Register", href: "/register" },
    ],
  },
] as const;

export function PublicFooter() {
  return (
    <footer className="ks-public border-t border-[var(--ks-line)] ks-surface">
      <div className="ks-wrap grid gap-10 py-12 md:grid-cols-[1.2fr_repeat(3,1fr)]">
        <div>
          <p className="text-sm font-extrabold tracking-[0.12em]">KING SPARKON</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-[var(--ks-muted)]">
            Events, commerce and opportunities connected in one platform.
          </p>
          <SocialLinks variant="public" className="mt-5" />
        </div>
        {groups.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="ks-eyebrow">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--ks-ink)] hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="ks-wrap flex flex-wrap items-center justify-between gap-4 border-t border-[var(--ks-line)] py-5 text-xs text-[var(--ks-muted)]">
        <p>© {new Date().getFullYear()} King Sparkon. Trademark platform of Sizolwakhe Leonard Mthimunye.</p>
        <CookieSettingsButton variant="footer" />
      </div>
    </footer>
  );
}
