"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const worldLinks = [
  { label: "Users", href: "/users", hint: "Discover, buy, attend, participate" },
  { label: "Artists", href: "/artists", hint: "Perform, get discovered, earn" },
  { label: "Businesses", href: "/businesses", hint: "Events, products, people, growth" },
  { label: "Workers", href: "/workers", hint: "Shifts, scans, tickets, tips" },
] as const;

const quietLinks = [
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
] as const;

const navLinks = [...worldLinks, ...quietLinks] as const;

export function PremiumHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // lock scroll when menu open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 pt-[env(safe-area-inset-top)]">
      {/* Top notice */}
      <div className="hidden border-b border-[rgba(139,92,246,0.3)] bg-black px-4 py-1 text-center text-[0.6875rem] font-bold text-[var(--premium-gold)] md:block">
        Barcode operations, QR tickets, jobs and role-safe dashboards — one verified platform.
      </div>

      {/* Glass nav shell */}
      <div className={`border-b transition-all ${scrolled ? "border-[rgba(139,92,246,0.35)] bg-[rgba(5,5,12,0.88)] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.6)]" : "border-[var(--line)] bg-black/90 backdrop-blur-[8px]"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-2 md:px-8" aria-label="Primary">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={160} height={71} className="h-auto w-[88px] shrink-0 object-contain sm:w-[160px]" priority />
          </Link>

          {/* Desktop nav — the worlds of King Sparkon */}
          <div className="hidden items-center gap-0.5 xl:flex" role="group" aria-label="Worlds">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                title={"hint" in l ? l.hint : l.label}
                className="group relative px-3 py-2 text-sm font-semibold text-[var(--steel)] transition-colors duration-200 hover:text-white motion-reduce:transition-none"
              >
                {l.label}
                <span className="absolute inset-x-3 -bottom-px h-px origin-left scale-x-0 bg-gradient-to-r from-[var(--premium-cyan)] to-[var(--premium-gold)] transition-transform duration-200 group-hover:scale-x-100 motion-reduce:transition-none" aria-hidden="true" />
                <span className="absolute -top-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--premium-gold)] opacity-0 transition-opacity duration-200 group-hover:opacity-100 motion-reduce:transition-none" aria-hidden="true" />
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {/* Always visible, including mobile view */}
            <Link
              href="/login"
              className="inline-flex min-h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-lg px-2 text-[11px] font-bold text-[var(--steel)] hover:text-[var(--premium-cyan)] sm:min-h-10 sm:px-3 sm:text-[0.8125rem]"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-[var(--premium-gold)]/50 bg-[var(--premium-gold)]/10 px-3 text-xs font-extrabold text-[var(--premium-gold)] transition-colors duration-200 hover:bg-[var(--premium-gold)] hover:text-black sm:h-10 sm:px-4 sm:text-[0.8125rem] motion-reduce:transition-none"
            >
              <span>Enter Sparkon</span>
              <ArrowRight className="hidden h-3.5 w-3.5 sm:block" />
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="ml-1 grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line-strong)] bg-[#0d0d1c] text-white hover:border-[var(--premium-magenta)] hover:text-[var(--premium-gold)] xl:hidden"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile panel */}
      {open ? (
        <div className="absolute inset-x-0 top-full border-b border-[var(--line-strong)] bg-[rgba(5,5,12,0.97)] backdrop-blur-[20px] shadow-[0_18px_50px_rgba(0,0,0,0.7)] xl:hidden">
          <div className="mx-auto max-w-7xl px-5 py-4 md:px-8">
            <div className="grid gap-1">
              <p className="px-3 pb-1 font-mono text-[0.625rem] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Who&apos;s here</p>
              {worldLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 hover:bg-[rgba(139,92,246,0.14)]"
                >
                  <span className="text-sm font-bold text-[var(--ink)] group-hover:text-[var(--premium-gold)]">{l.label}</span>
                  <span className="truncate text-xs text-[var(--muted)]">{l.hint}</span>
                </Link>
              ))}
              <p className="px-3 pb-1 pt-3 font-mono text-[0.625rem] font-black uppercase tracking-[0.18em] text-[var(--muted)]">Understand</p>
              {quietLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--steel)] hover:bg-[rgba(139,92,246,0.14)] hover:text-[var(--premium-gold)]"
                >
                  {l.label}
                </Link>
              ))}
              <div className="mt-3 grid gap-2 border-t border-[var(--line)] pt-4">
                <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl border border-[var(--line-strong)] bg-[#0d0d1c] px-3 py-2.5 text-center text-xs font-extrabold text-[var(--ink)] hover:border-[var(--premium-cyan)] hover:text-[var(--premium-cyan)]">
                  Login
                </Link>
                <Link
                  href="/register"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-[var(--premium-gold)]/50 bg-[var(--premium-gold)]/10 px-3 py-2.5 text-center text-xs font-extrabold text-[var(--premium-gold)] hover:bg-[var(--premium-gold)] hover:text-black"
                >
                  Enter Sparkon
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
