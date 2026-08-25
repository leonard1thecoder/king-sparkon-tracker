"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Building2, Handshake, Ticket, BriefcaseBusiness, WalletCards, Barcode, QrCode } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type Slide = {
  key: "users" | "businesses" | "affiliates";
  label: string;
  title: string;
  copy: string;
  bullets: string[];
  href: string;
  cta: string;
  icon: typeof ShoppingCart;
};

const slides: Slide[] = [
  {
    key: "users",
    label: "Users",
    title: "Users — Buy, track, manage",
    copy: "King Sparkon Lego Mall, Lego Tickets, and Job posts — all from a single user dashboard that never looks like an owner console.",
    bullets: ["Browse Lego Mall products", "Check QR tickets", "Track job applications"],
    href: "/dashboard/user/shop",
    cta: "Open Lego Mall",
    icon: ShoppingCart,
  },
  {
    key: "businesses",
    label: "Businesses",
    title: "Businesses — Stock, workers, sales",
    copy: "Products with barcodes, night pricing, workers, transactions, withdrawals, tips, tickets, jobs and promotions — role-safe and audit-ready.",
    bullets: ["Products & barcodes", "Workers & transactions", "Tickets & capacity"],
    href: "/dashboard/owner/products",
    cta: "Open Business Dashboard",
    icon: Building2,
  },
  {
    key: "affiliates",
    label: "Affiliates",
    title: "Affiliates — Refer, earn, track",
    copy: "Referral links, QR codes, campaign assets, commissions and payouts — all visible before withdrawal.",
    bullets: ["Referral link + QR", "Commission ledger", "Payout readiness"],
    href: "/guides/affiliate-referrals",
    cta: "Affiliate Guide",
    icon: Handshake,
  },
];

export function HowItWorksRoleSlider() {
  const [active, setActive] = useState<Slide["key"]>("users");
  const activeIndex = slides.findIndex((s) => s.key === active);

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="flex flex-wrap gap-3">
        {slides.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              setActive(s.key);
              document.getElementById("role-slider")?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition ${active === s.key ? "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)]" : "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal-strong)]"}`}
            aria-pressed={active === s.key}
          >
            {s.label} {active === s.key ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>

      <div id="role-slider" className="mt-8 scroll-mt-28 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {slides.map((s) => (
              <div key={s.key} className="w-full shrink-0 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]">
                    <s.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">{s.label}</p>
                    <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">{s.title}</h3>
                  </div>
                </div>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--steel)]">{s.copy}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {s.bullets.map((b) => (
                    <span key={b} className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1 text-xs font-bold text-[var(--steel)]">
                      {b}
                    </span>
                  ))}
                </div>
                <Link href={s.href} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">
                  {s.cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[var(--line)] bg-[var(--surface)]/60 px-4 py-3">
          {slides.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              aria-label={`Show ${s.label} slide`}
              aria-current={active === s.key ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${active === s.key ? "w-8 bg-[var(--signal)]" : "w-2.5 bg-[var(--line)] hover:bg-[var(--line-strong)]"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
