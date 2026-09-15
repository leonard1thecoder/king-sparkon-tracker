"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Barcode, Megaphone, QrCode, Wallet } from "lucide-react";

type SlideKey = "users" | "businesses" | "affiliates";

const SLIDES: { key: SlideKey; label: string; hash: string }[] = [
  { key: "users", label: "Users", hash: "#guides-users" },
  { key: "businesses", label: "Businesses", hash: "#guides-businesses" },
  { key: "affiliates", label: "Affiliates", hash: "#guides-affiliates" },
];

function slideFromHash(hash: string): SlideKey | null {
  if (hash === "#guides-users") return "users";
  if (hash === "#guides-businesses") return "businesses";
  if (hash === "#guides-affiliates") return "affiliates";
  return null;
}

type GuideCard = {
  slug: string;
  icon: typeof Barcode;
  title: string;
  copy: string;
  read: string;
};

const userGuides: GuideCard[] = [
  {
    slug: "qr-ticket-operations",
    icon: QrCode,
    title: "QR Ticket Operations Manual",
    copy: "Buy tickets, keep the QR in My Tickets and get verified at the gate with correct checked-in totals.",
    read: "7 min",
  },
  {
    slug: "worker-tips-payouts",
    icon: Wallet,
    title: "Worker Tips, Fees & Payouts",
    copy: "Tip workers via QR with transparent amounts before the owner approves anything.",
    read: "6 min",
  },
];

const businessGuides: GuideCard[] = [
  {
    slug: "barcode-inventory-guide",
    icon: Barcode,
    title: "Barcode Inventory Guide",
    copy: "Register products, assign unit barcodes, adjust stock without losing history, and use night-shift pricing.",
    read: "8 min",
  },
  {
    slug: "qr-ticket-operations",
    icon: QrCode,
    title: "QR Ticket Operations Manual",
    copy: "Create events, set capacity, sell tickets, and verify QR codes at the gate.",
    read: "7 min",
  },
  {
    slug: "worker-tips-payouts",
    icon: Wallet,
    title: "Worker Tips, Fees & Payouts",
    copy: "How tip QR flows, gross/fee/net and withdrawal status keep money transparent before the owner approves.",
    read: "6 min",
  },
];

const affiliateGuides: GuideCard[] = [
  {
    slug: "affiliate-referrals",
    icon: Megaphone,
    title: "Affiliate Referrals & Campaigns",
    copy: "Referral codes, promotion quotes, audience targeting and commission visibility — no guesswork on earnings.",
    read: "6 min",
  },
  {
    slug: "qr-ticket-operations",
    icon: QrCode,
    title: "QR Ticket Operations Manual",
    copy: "Understand the events you promote: capacity, ticket classes and how gate verification works.",
    read: "7 min",
  },
];

function GuideCards({ cards }: { cards: GuideCard[] }) {
  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2">
      {cards.map((g) => (
        <Link key={`${g.slug}-${g.title}`} href={`/guides/${g.slug}`} className="group flex flex-col rounded-xl border border-[var(--line)] bg-white p-5 transition hover:border-[var(--signal)]">
          <div className="flex items-center justify-between">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--signal)]">
              <g.icon className="h-4 w-4" />
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[var(--signal-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--signal-strong)]">{g.read}</span>
          </div>
          <h4 className="mt-4 font-black">{g.title}</h4>
          <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{g.copy}</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-[var(--signal-strong)] group-hover:text-[var(--accent-hover)]">
            Read guide <ArrowRight className="h-4 w-4" />
          </span>
        </Link>
      ))}
    </div>
  );
}

export function GuidesRoleSlider() {
  const [active, setActive] = useState<SlideKey>("users");
  const activeIndex = active === "users" ? 0 : active === "businesses" ? 1 : 2;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  // Deep-link support: /guides#guides-businesses opens the businesses slide.
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
    <div id="guides-roles" className="scroll-mt-28">
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
            <div id="guides-users" data-slide="users" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">For Users</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Guides for users — attend, buy, tip</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">Just what a user needs to attend events and tip workers. Click a tab above to see another role.</p>
              <GuideCards cards={userGuides} />
            </div>

            {/* Businesses Slide */}
            <div id="guides-businesses" data-slide="businesses" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">For Businesses</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Guides for businesses — stock, events, money</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">Run inventory, ticket events and payouts without spreadsheet errors. Click a tab above to see another role.</p>
              <GuideCards cards={businessGuides} />
            </div>

            {/* Affiliates Slide */}
            <div id="guides-affiliates" data-slide="affiliates" className="w-full shrink-0 scroll-mt-28 p-6 md:p-8">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">For Affiliates</p>
              <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Guides for affiliates — promote, earn</h3>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">Referrals, campaign quotes and the events you promote. Click a tab above to see another role.</p>
              <GuideCards cards={affiliateGuides} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[var(--line)] bg-[var(--surface)]/60 px-4 py-3">
          {SLIDES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => select(s.key)}
              aria-label={`Show ${s.label} guides`}
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
