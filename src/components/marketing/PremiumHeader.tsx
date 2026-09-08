"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";

const navLinks = [
  { label: "How it works", href: "/how-it-works" },
  { label: "Features", href: "/features" },
  { label: "Guides", href: "/guides" },
  { label: "Articles", href: "/articles" },
  { label: "Jobs", href: "/jobs" },
  { label: "UIF", href: "/uif" },
  { label: "About", href: "/about" },
  { label: "FAQ", href: "/faq" },
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Contact", href: "/contact" },
] as const;

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
      <div className="hidden border-b border-[rgba(139,92,246,0.3)] bg-black px-4 py-1.5 text-center text-xs font-bold text-[var(--premium-gold)] md:block">
        Barcode operations, QR tickets, jobs and role-safe dashboards — one verified platform.
      </div>

      {/* Glass nav shell */}
      <div className={`border-b transition-all ${scrolled ? "border-[rgba(139,92,246,0.35)] bg-[rgba(5,5,12,0.88)] backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.6)]" : "border-[var(--line)] bg-black/90 backdrop-blur-[8px]"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3 md:px-8" aria-label="Primary">
          <Link href="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={44} height={44} className="rounded-xl border border-[var(--line-strong)] bg-[#0d0d1c] p-1 shadow-[0_0_18px_rgba(139,92,246,0.25)]" priority />
            <div className="leading-none">
              <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--premium-gold)]">King Sparkon</p>
              <p className="text-[15px] font-black tracking-[-0.02em] text-white">Tracker™</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 xl:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-3 py-2 text-sm font-semibold text-[var(--steel)] hover:bg-[rgba(139,92,246,0.14)] hover:text-[var(--premium-gold)]"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="inline-flex min-h-9 items-center justify-center rounded-xl border border-[var(--line-strong)] bg-[#0d0d1c] px-2.5 text-xs font-extrabold text-[var(--steel)] hover:border-[var(--premium-cyan)] hover:text-[var(--premium-cyan)] sm:min-h-10 sm:px-4 sm:text-sm"
            >
              Login
            </Link>
            <Link
              href="/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE"
              className="inline-flex min-h-9 items-center justify-center gap-2 rounded-xl border border-transparent bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 px-2.5 text-xs font-extrabold text-white shadow-[0_8px_22px_rgba(139,92,246,0.4)] hover:from-yellow-300 hover:via-pink-500 hover:to-cyan-400 hover:text-black sm:min-h-10 sm:px-4 sm:text-sm"
            >
              <span className="hidden sm:inline">Register</span>
              <span className="sm:hidden">Register</span>
              <ArrowRight className="hidden h-4 w-4 sm:block" />
            </Link>

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="ml-1 grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--line-strong)] bg-[#0d0d1c] text-white hover:border-[var(--premium-magenta)] hover:text-[var(--premium-gold)] xl:hidden"
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
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--ink)] hover:bg-[rgba(139,92,246,0.14)] hover:text-[var(--premium-gold)]"
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
                  className="rounded-xl border border-transparent bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 px-3 py-2.5 text-center text-xs font-extrabold text-white hover:from-yellow-300 hover:via-pink-500 hover:to-cyan-400 hover:text-black"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
