"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, Megaphone, QrCode, ScanLine, ShoppingCart, WalletCards } from "lucide-react";

type SlideKey = "users" | "businesses" | "affiliates";

const SLIDES: { key: SlideKey; label: string; hash: string }[] = [
  { key: "users", label: "Users", hash: "#features-users" },
  { key: "businesses", label: "Businesses", hash: "#features-businesses" },
  { key: "affiliates", label: "Affiliates", hash: "#features-affiliates" },
];

function slideFromHash(hash: string): SlideKey | null {
  if (hash === "#features-users") return "users";
  if (hash === "#features-businesses") return "businesses";
  if (hash === "#features-affiliates") return "affiliates";
  return null;
}

type FeatureCard = {
  icon: typeof ScanLine;
  title: string;
  copy: string;
  bullets: string[];
  guide?: string;
};

const userFeatures: FeatureCard[] = [
  {
    icon: QrCode,
    title: "QR tickets & gate entry",
    copy: "Buy event tickets, keep every QR in My Tickets and present it at the gate for verification.",
    bullets: ["Buyer ticket archive", "Gate verification"],
    guide: "/guides/qr-ticket-operations",
  },
  {
    icon: ShoppingCart,
    title: "Cart, checkout & collection",
    copy: "Browse the tuck-shop, check out and collect with a purchase QR. Cash, card machine or website payment.",
    bullets: ["Collection QR", "Payment status"],
  },
  {
    icon: BriefcaseBusiness,
    title: "Job opportunities",
    copy: "Apply with a CV URL and track each application from SUBMITTED to ACCEPTED.",
    bullets: ["Applications", "Status timeline"],
  },
  {
    icon: WalletCards,
    title: "Tip workers",
    copy: "Tip workers straight from their tip QR with transparent amounts before you confirm.",
    bullets: ["QR tip flows"],
    guide: "/guides/worker-tips-payouts",
  },
];

const businessFeatures: FeatureCard[] = [
  {
    icon: ScanLine,
    title: "Barcode inventory",
    copy: "Products carry individual barcodes. Stock quantity, barcode count and remaining slots stay visible with clean history.",
    bullets: ["Unit codes", "Remaining slots", "Night-shift pricing"],
    guide: "/guides/barcode-inventory-guide",
  },
  {
    icon: QrCode,
    title: "QR tickets & capacity",
    copy: "Ticket classes, sold quantity and checked-in totals. The ledger never double-counts capacity.",
    bullets: ["Capacity totals", "Gate verification"],
    guide: "/guides/qr-ticket-operations",
  },
  {
    icon: ShoppingCart,
    title: "Counter & online sales",
    copy: "SELL transactions require barcodes matching quantity; BUY purchases need none. Every sale is ledger-backed.",
    bullets: ["Idempotent checkout", "Collection QR"],
  },
  {
    icon: BriefcaseBusiness,
    title: "Publish jobs & review",
    copy: "Publish roles with workplace and experience levels, then review applications through a clear status pipeline.",
    bullets: ["Publish & close", "Status timeline"],
  },
  {
    icon: WalletCards,
    title: "Tips ledger & withdrawals",
    copy: "Review tips at gross/fee/net. Withdrawals for transactions or tips show status and audit timestamps.",
    bullets: ["Fee transparency", "Withdrawal ledger"],
    guide: "/guides/worker-tips-payouts",
  },
  {
    icon: Megaphone,
    title: "Promotions & quotes",
    copy: "Target audience plus channel with a quote (targetCount, bulkPrice) before anything is sent.",
    bullets: ["Quote before send"],
    guide: "/guides/affiliate-referrals",
  },
];

const affiliateFeatures: FeatureCard[] = [
  {
    icon: Megaphone,
    title: "Referral assets",
    copy: "Instant referral code, promotion link and QR card after approval. Share anywhere and track clicks.",
    bullets: ["Referral assets", "QR card"],
    guide: "/guides/affiliate-referrals",
  },
  {
    icon: WalletCards,
    title: "Commissions & payouts",
    copy: "Pending, approved and paid commissions stay visible with gross/net before you withdraw.",
    bullets: ["Commission view", "Payout status"],
    guide: "/guides/affiliate-referrals",
  },
];

function FeatureCards({ cards }: { cards: FeatureCard[] }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {cards.map((f) => (
        <div key={f.title} className="flex flex-col rounded-xl border border-[var(--line)] bg-white p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--signal)]">
              <f.icon className="h-4 w-4" />
            </div>
            <h4 className="font-black">{f.title}</h4>
          </div>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{f.copy}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {f.bullets.map((b) => (
              <span key={b} className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-xs font-bold text-[var(--steel)]">{b}</span>
            ))}
          </div>
          {f.guide ? (
            <Link href={f.guide} className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">
              Read guide <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function FeaturesRoleSlider() {
  const [active, setActive] = useState<SlideKey>("users");
  const activeIndex = active === "users" ? 0 : active === "businesses" ? 1 : 2;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  // Deep-link support: /features#features-businesses opens the businesses slide.
  // Uses native history API so it stays in sync with Next.js router.
  useEffect(() => {
    const fromHash = slideFromHash(window.location.hash);
    if (fromHash) setActive(fromHash);
    const onHashChange = () => {
      const next = slideFromHash(window.location.hash);
      if (next) setActive(next);
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const select = useCallback((key: SlideKey) => {
    setActive(key);
    const hash = SLIDES.find((s) => s.key === key)?.hash ?? "";
    // Update URL without triggering a scroll jump; the slide switches on click.
    window.history.replaceState(null, "", hash);
  }, []);

  // Collapse the viewport to the active slide's height so shorter slides don't
  // leave empty space below their content.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateHeight = () => {
      const slide = viewport.querySelector<HTMLElement>(`[data-slide="${active}"]`);
      if (slide) setViewportHeight(slide.offsetHeight);
    };
    updateHeight();
    const slides = Array.from(viewport.querySelectorAll<HTMLElement>("[data-slide]"));
    const observer = new ResizeObserver(updateHeight);
    slides.forEach((slide) => observer.observe(slide));
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [active]);

  return (
    <div id="features-roles" className="scroll-mt-28">
      <div className="flex flex-wrap justify-center gap-3">
        {SLIDES.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => select(s.key)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition ${
              active === s.key
                ? "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)]"
                : "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal-strong)]"
            }`}
            aria-pressed={active === s.key}
          >
            {s.label} {active === s.key ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>

      <div className="mt-8 scroll-mt-28 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
        <div ref={viewportRef} className="relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ height: viewportHeight ?? undefined }}>
          <div
            className="flex items-start transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {/* Users Slide */}
            <div id="features-users" data-slide="users" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">For Users</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Features for users — buy, attend, apply</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">Everything a user touches lives in one focused workspace: tickets, cart, jobs and tips. Click a tab above to see another role.</p>
              <FeatureCards cards={userFeatures} />
            </div>

            {/* Businesses Slide */}
            <div id="features-businesses" data-slide="businesses" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">For Businesses</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Features for businesses — full operations console</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">Stock, events, sales, jobs, tips and promotions with ledger-backed totals. Click a tab above to see another role.</p>
              <FeatureCards cards={businessFeatures} />
            </div>

            {/* Affiliates Slide */}
            <div id="features-affiliates" data-slide="affiliates" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">For Affiliates</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Features for affiliates — refer, share, earn</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">Referral assets, campaign quotes and commission visibility before withdrawal. Click a tab above to see another role.</p>
              <FeatureCards cards={affiliateFeatures} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[var(--line)] bg-[var(--surface)]/60 px-4 py-3">
          {SLIDES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => select(s.key)}
              aria-label={`Show ${s.label} features`}
              aria-current={active === s.key ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all ${
                active === s.key ? "w-8 bg-[var(--signal)]" : "w-2.5 bg-[var(--line)] hover:bg-[var(--line-strong)]"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
