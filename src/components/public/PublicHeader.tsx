"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

const primaryLinks = [
  { label: "Events", href: "/events" },
  { label: "Mall", href: "/mall" },
  { label: "Job Posts", href: "/jobs" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PublicHeader() {
  const pathname = usePathname() ?? "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="ks-public ks-header" data-scrolled={scrolled}>
      <div className="ks-wrap flex items-center justify-between gap-6 py-3">
        <Link href="/" className="flex shrink-0 items-center" aria-label="King Sparkon home">
          <img src="/king-sparkon-logo.svg" alt="King Sparkon" className="h-11 w-auto" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 md:flex">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="ks-nav-link"
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:block">
            <Link href="/login" className="ks-btn ks-btn-secondary ks-btn-sm">Sign in</Link>
          </div>
          <Link href="/register" className="ks-btn ks-btn-primary ks-btn-sm md:px-5 md:py-3 md:text-[0.95rem]">Get Started</Link>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--ks-line)] ks-surface md:hidden"
          aria-expanded={menuOpen}
          aria-controls="ks-mobile-nav"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="sr-only">{menuOpen ? "Close menu" : "Open menu"}</span>
          {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </div>

      <div id="ks-mobile-nav" hidden={!menuOpen} className="border-t border-[var(--ks-line)] ks-surface md:hidden">
        <nav aria-label="Mobile primary" className="ks-wrap flex flex-col py-3">
          {primaryLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="py-3 text-base font-semibold"
              aria-current={isActive(pathname, link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-3 grid grid-cols-2 gap-3 pb-2">
            <Link href="/login" className="ks-btn ks-btn-secondary justify-center">Sign in</Link>
            <Link href="/register" className="ks-btn ks-btn-primary justify-center">Get Started</Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
