"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Handshake, ShoppingCart } from "lucide-react";
import { Faq, type FaqItem } from "@/components/content/Faq";

type SlideKey = "users" | "businesses" | "affiliates";

const userFaqs: FaqItem[] = [
  {
    question: "What can I do as a User?",
    answer:
      "Shop products in the Lego Mall, keep a cart, buy QR tickets, tip workers from the tip cart, browse jobs and track applications, follow favorite businesses, and use UIF status and password services — all from /dashboard/user.",
  },
  {
    question: "How do I buy products and pay?",
    answer:
      "Add products to the cart and check out through the shared PayFast payout, the same payout used for tickets, tips and UIF carts. Website payments return a paymentUrl, paymentStatus and reference so you can track the order to collection.",
  },
  {
    question: "How do QR tickets work?",
    answer:
      "Buy tickets for published events and keep them in My Tickets. At the gate a worker scans your QR and compares your verification photo before admission. The backend marks tickets fulfilled and prevents reuse.",
  },
  {
    question: "How do I tip a worker?",
    answer:
      "Open Tip Worker, scan the worker QR (or enter the worker ID), set an amount and submit it to the tip cart. Pay the cart through the shared PayFast payout — the same payout as products and tickets.",
  },
  {
    question: "How do UIF status checks and password updates work?",
    answer:
      "Enter your 13-digit SA ID at /dashboard/user/uif/status to check benefit history. Password updates create a R14.28 reset cart at /dashboard/user/uif/cart; paying it triggers the update. IDs are sent securely and never stored on the device.",
  },
  {
    question: "How do jobs and applications work?",
    answer:
      "Browse open posts at /dashboard/user/jobs, apply with your details and an optional CV link, then track every application from submitted to accepted at /dashboard/user/applications.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Yes. The native Android app is downloadable from the Download section on the landing page, with the same shop, tickets, tip cart, jobs and UIF flows. The iOS app is coming soon.",
  },
  {
    question: "How is my data handled?",
    answer:
      "Auth tokens are stored as httpOnly cookies via /api/auth/* route handlers; the browser never handles backend secrets. CASH and SWIPE_MACHINE flows never subscribe you to anything — only website payments can create a CLIENT subscriber record.",
  },
];

const businessFaqs: FaqItem[] = [
  {
    question: "How do I start a business on the platform?",
    answer:
      "Register as a business owner to get a businessId, business QR and owner workspace immediately. The free trial starts at signup; Plus and Pro billing is confirmed from the dashboard, not the signup form.",
  },
  {
    question: "How do products, barcodes and SELL vs BUY work?",
    answer:
      "Add products with price, category and stock quantity; each unit gets a scanable barcode. SELL requires barcodes.length to equal total quantity so every sold unit is traceable, while BUY must not send barcodes. Stock quantity and barcode count stay separate, with remaining slots computed server-side.",
  },
  {
    question: "What do the plans mean for my workers?",
    answer:
      "FREE_TRIAL allows up to 2 workers, PLUS up to 5, PRO is unlimited. Pro unlocks WORKER_TIPS_PLATFORM, BUSINESS_ANALYSIS_AI and WORKER_CLOCKER. The UI respects backend feature locks instead of showing dead buttons.",
  },
  {
    question: "How do tickets and capacity work?",
    answer:
      "Create events with ticket classes (quantity, price, sold, checkedIn). Buyers keep QR tickets in My Tickets and workers verify them at the gate. Capacity dashboards aggregate tickets, workers, jobs, stock and platform totals.",
  },
  {
    question: "How do worker tips and withdrawals work?",
    answer:
      "Enable tips per worker to activate their tip QR. Tips expose gross, fee and net amounts — never computed in the browser. Withdrawals for transactions and tips show gross/fee/net and status before approval.",
  },
  {
    question: "Are payments and fees transparent?",
    answer:
      "Yes. Transactions support CASH, SWIPE_MACHINE and WEBSITE_PAYMENT. Website payments return paymentUrl, paymentStatus and reference. No hidden rounding anywhere in the money path.",
  },
  {
    question: "What do I get for promotions, billing and oversight?",
    answer:
      "Quote audience count and bulk price before sending email, WhatsApp or any-channel campaigns. Billing shows plans, subscriptions and activation. Reports and audit logs keep every stock, ticket, tip and promotion action reviewable.",
  },
];

const affiliateFaqs: FaqItem[] = [
  {
    question: "What does an affiliate do?",
    answer:
      "Share your tracked referral link and QR, download administrator-approved campaign posters, and earn commission on the customers you bring. Everything lives in /dashboard/affiliate.",
  },
  {
    question: "How are referrals tracked?",
    answer:
      "Your link carries your affiliate code and every visit, signup and sale angle is recorded against it. Leads show subscriber contacts plus the sales angle that fits them.",
  },
  {
    question: "How do commissions work?",
    answer:
      "Approved earnings land in the commissions ledger with the referral, amount and state. Only approved commissions become payable — pending ones stay visible until review.",
  },
  {
    question: "How and when do I get paid?",
    answer:
      "Cash out approved commissions from Payouts to your PayPal payout account. Each payout shows gross, fee, net and settlement status before and after it clears.",
  },
  {
    question: "Where do I get marketing material?",
    answer:
      "Campaign Assets holds administrator-approved posters and snippets you can download and share. Only approved material is listed, so you never promote stale offers.",
  },
  {
    question: "Can I receive tips as an affiliate?",
    answer:
      "Yes. Affiliate accounts are tippable like workers: supporters tip through the same tip flow and the amounts settle through the normal payout path.",
  },
];

const slides: Array<{
  key: SlideKey;
  label: string;
  icon: typeof ShoppingCart;
  eyebrow: string;
  title: string;
  copy: string;
  faqs: FaqItem[];
  cta: { label: string; href: string };
}> = [
  {
    key: "users",
    label: "Users",
    icon: ShoppingCart,
    eyebrow: "Users",
    title: "Users — shop, tickets, tips, jobs",
    copy: "Buying, tipping, job hunting and UIF services from one light workspace.",
    faqs: userFaqs,
    cta: { label: "Open Lego Mall", href: "/dashboard/user/shop" },
  },
  {
    key: "businesses",
    label: "Businesses",
    icon: Building2,
    eyebrow: "Businesses",
    title: "Businesses — full operations console",
    copy: "Stock, workers, tickets, tips, promotions, billing and audit from the owner workspace.",
    faqs: businessFaqs,
    cta: { label: "Open Business Dashboard", href: "/dashboard/owner/products" },
  },
  {
    key: "affiliates",
    label: "Affiliates",
    icon: Handshake,
    eyebrow: "Affiliates",
    title: "Affiliates — links, commissions, payouts",
    copy: "Referral tracking, campaign assets and clear commission visibility.",
    faqs: affiliateFaqs,
    cta: { label: "Open Affiliate Dashboard", href: "/dashboard/affiliate/referrals" },
  },
];

export function FaqRoleSlider() {
  const [active, setActive] = useState<SlideKey>("users");
  const activeIndex = active === "users" ? 0 : active === "businesses" ? 1 : 2;
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);

  // Collapse the viewport to the active slide's height so shorter slides
  // don't leave empty space below their content.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const updateHeight = () => {
      const slide = viewport.querySelector<HTMLElement>(`[data-slide="${active}"]`);
      if (slide) setViewportHeight(slide.offsetHeight);
    };
    updateHeight();
    const observed = Array.from(viewport.querySelectorAll<HTMLElement>("[data-slide]"));
    const observer = new ResizeObserver(updateHeight);
    observed.forEach((slide) => observer.observe(slide));
    window.addEventListener("resize", updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateHeight);
    };
  }, [active]);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3">
        {slides.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => setActive(s.key)}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-extrabold transition ${active === s.key ? "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[var(--shadow-soft)]" : "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:border-[var(--signal)] hover:text-[var(--signal-strong)]"}`}
            aria-pressed={active === s.key}
          >
            {s.label} {active === s.key ? <ArrowRight className="h-4 w-4" /> : null}
          </button>
        ))}
      </div>

      <div className="mt-8 scroll-mt-28 overflow-hidden rounded-2xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
        <div ref={viewportRef} className="relative overflow-hidden transition-[height] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ height: viewportHeight ?? undefined }}>
          <div className="flex items-start transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {slides.map((s) => (
              <div key={s.key} data-slide={s.key} className="w-full shrink-0 p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]"><s.icon className="h-6 w-6" /></div>
                  <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">{s.eyebrow}</p><h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">{s.title}</h3></div>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">{s.copy}</p>
                <div className="mt-6">
                  <Faq items={s.faqs} />
                </div>
                <Link href={s.cta.href} className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">{s.cta.label} <ArrowRight className="h-4 w-4" /></Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
