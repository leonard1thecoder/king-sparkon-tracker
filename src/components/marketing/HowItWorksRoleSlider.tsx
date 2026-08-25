"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ShoppingCart, Building2, Handshake, Ticket, BriefcaseBusiness, WalletCards, Barcode, QrCode, ScanLine, UsersRound, CheckCircle2 } from "lucide-react";

type SlideKey = "users" | "businesses" | "affiliates";

export function HowItWorksRoleSlider() {
  const [active, setActive] = useState<SlideKey>("users");
  const activeIndex = active === "users" ? 0 : active === "businesses" ? 1 : 2;

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8">
      <div className="flex flex-wrap gap-3">
        {[
          { key: "users" as SlideKey, label: "Users" },
          { key: "businesses" as SlideKey, label: "Businesses" },
          { key: "affiliates" as SlideKey, label: "Affiliates" },
        ].map((s) => (
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
          <div className="flex transition-transform duration-[2000ms] ease-[cubic-bezier(0.22,1,0.36,1)]" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
            {/* Users Slide */}
            <div className="w-full shrink-0 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]"><ShoppingCart className="h-6 w-6" /></div>
                <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">Users</p><h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Users — Browse Lego Mall, tickets, jobs</h3></div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">User dashboard is built for buying, not managing stock. Four focused workspaces keep the experience light and distinct from the owner console.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { n: "01", title: "Browse King Sparkon Lego Mall", copy: "Explore four businesses per page, scroll horizontally per business, search by product or business ID, add to cart and checkout via Stripe.", icon: ShoppingCart },
                  { n: "02", title: "King Sparkon Lego Ticket", copy: "Buy ticket created by businesses registered, and use the purchased ticket to attend event through verification processes", icon: QrCode },
                  { n: "03", title: "Track job applications", copy: "Browse job posts, apply, and track application status from applied to shortlisted. All inside the user workspace.", icon: BriefcaseBusiness },
                  { n: "04", title: "Manage profile & cart", copy: "Update profile, manage cart, check UIF and SASSA status via the header profile — no owner-like metrics or inventory controls.", icon: UsersRound },
                ].map((s) => (
                  <div key={s.n} className="rounded-xl border border-[var(--line)] bg-white p-5">
                    <div className="flex items-center gap-3"><span className="font-mono text-xs font-black text-[var(--signal-strong)]">{s.n}</span><div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--signal)]"><s.icon className="h-4 w-4" /></div><h4 className="font-black">{s.title}</h4></div>
                    <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{s.copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div><h4 className="font-black">User → screen</h4><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Shop → Cart → My Tickets → Applications → Profile. No workers, transactions, or billing screens.</p></div>
                <div><h4 className="font-black">Why it matters</h4><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Keeps the buying experience focused and prevents the “looks like owner dashboard” confusion.</p></div>
              </div>
              <Link href="/dashboard/user/shop" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Open Lego Mall <ArrowRight className="h-4 w-4" /></Link>
            </div>

            {/* Businesses Slide - detailed from request */}
            <div className="w-full shrink-0 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]"><Building2 className="h-6 w-6" /></div>
                <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">Businesses</p><h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Businesses — Full operations console</h3></div>
              </div>
              <div className="mt-6 grid gap-4">
                {[
                  { n: "01", title: "Owner registers the business", copy: "Create a Business Owner account. The backend provisions a businessId, business QR and owner workspace. Free trial starts immediately; Plus/Pro billing is confirmed from the dashboard, not the signup form.", link: "/register?plan=FREE_TRIAL_BUSINESS&privilege=BUSINESS_OWNER&service=FULL_BUSINESS_SUITE", label: "Register as business owner", icon: UsersRound },
                  { n: "02", title: "Inventory is created with barcodes", copy: "Add products with price, category, stock quantity and optional night-shift pricing. Each unit receives a scanable barcode or unit code. Quantity adjustments are patched and logged; barcodes are appended without overwriting history.", icon: Barcode },
                  { n: "03", title: "Tickets or carts are opened to buyers", copy: "Events get ticket classes with capacity, or products are exposed in the tuck-shop/cart. Buyers receive QR tickets and purchase QRs. Workers later scan these at collection or gate.", icon: QrCode },
                  { n: "04", title: "Workers scan, users pay", copy: "At the terminal, workers scan barcodes for SELL transactions (barcodes must match quantity) or process BUY purchases. Website payments surface paymentUrl, paymentStatus and referenceEmail for the client subscriber record.", icon: ScanLine },
                  { n: "05", title: "Tips, affiliates and payouts are settled", copy: "Worker tips use QR + callbackUrl. Affiliates share referral links and promotion assets. Withdrawals (transactions or tips) show gross, fee, net and status so owners never guess where money is.", icon: WalletCards },
                ].map((s) => (
                  <div key={s.n} className="rounded-xl border border-[var(--line)] bg-white p-5">
                    <div className="flex items-center gap-3"><span className="font-mono text-xs font-black text-[var(--signal-strong)]">{s.n}</span><div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--signal)]"><s.icon className="h-4 w-4" /></div><h4 className="font-black">{s.title}</h4></div>
                    <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{s.copy}</p>
                    {s.link ? <Link href={s.link} className="mt-3 inline-flex text-xs font-extrabold text-[var(--signal-strong)] hover:text-[var(--accent-hover)]">{s.label} →</Link> : null}
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div><h4 className="font-black">Role → screen mapping</h4><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Owner: products, tickets, transactions, promotions, billing. Worker: scan, barcodes, claims. Affiliate: referrals, commissions, assets. User: shop, tickets, jobs. Admin: users, businesses, scan-logs.</p></div>
                <div><h4 className="font-black">Why audit matters</h4><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Stock movement, ticket check-ins and tip payouts are persisted and reportable. Reports use GET /api/reports/* and audit logs GET /api/audit-logs — the UI never invents totals.</p></div>
                <div><h4 className="font-black">Payments</h4><p className="mt-1 text-sm leading-6 text-[var(--steel)]">CASH and SWIPE_MACHINE never subscribe the customer. WEBSITE_PAYMENT can create a CLIENT subscriber with paymentContact — handled server-side via the backend proxy.</p></div>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard/owner/products" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Open Business Dashboard <ArrowRight className="h-4 w-4" /></Link>
                <Link href="/features" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--line-strong)] bg-white px-5 text-sm font-extrabold hover:border-[var(--signal)]">See all features <CheckCircle2 className="h-4 w-4" /></Link>
              </div>
            </div>

            {/* Affiliates Slide */}
            <div className="w-full shrink-0 p-6 md:p-8">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] text-[var(--signal)]"><Handshake className="h-6 w-6" /></div>
                <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[var(--signal-strong)]">Affiliates</p><h3 className="mt-1 text-2xl font-black tracking-[-0.04em] md:text-3xl">Affiliates — Refer, share, earn</h3></div>
              </div>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--steel)]">Referral links, QR codes, campaign assets, commissions and payouts — all visible before withdrawal and audit-ready.</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {[
                  { n: "01", title: "Get referral link & QR", copy: "Instant referral code, promotion link and QR card after affiliate approval. Share anywhere.", icon: QrCode },
                  { n: "02", title: "Share campaign assets", copy: "Download posters, copy referral copy, track clicks and leads from the affiliate workspace.", icon: Ticket },
                  { n: "03", title: "Track commissions", copy: "Ledger shows pending, approved and paid commissions with gross/net and payout status.", icon: WalletCards },
                  { n: "04", title: "Request payouts", copy: "Withdraw to PayPal when eligible. Status and history stay visible in the dashboard.", icon: Handshake },
                ].map((s) => (
                  <div key={s.n} className="rounded-xl border border-[var(--line)] bg-white p-5">
                    <div className="flex items-center gap-3"><span className="font-mono text-xs font-black text-[var(--signal-strong)]">{s.n}</span><div className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] bg-white text-[var(--signal)]"><s.icon className="h-4 w-4" /></div><h4 className="font-black">{s.title}</h4></div>
                    <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{s.copy}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5">
                <div><h4 className="font-black">Affiliate → screen</h4><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Referrals → Campaign Assets → Commissions → Payouts → Leads → Profile.</p></div>
                <div><h4 className="font-black">Why it works</h4><p className="mt-1 text-sm leading-6 text-[var(--steel)]">Every referral and commission is ledger-backed, so earnings are provable, not promised.</p></div>
              </div>
              <Link href="/guides/affiliate-referrals" className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-extrabold text-white hover:bg-[var(--signal-strong)]">Affiliate Guide <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 border-t border-[var(--line)] bg-[var(--surface)]/60 px-4 py-3">
          {[
            { key: "users" as SlideKey, label: "Users" },
            { key: "businesses" as SlideKey, label: "Businesses" },
            { key: "affiliates" as SlideKey, label: "Affiliates" },
          ].map((s) => (
            <button key={s.key} type="button" onClick={() => setActive(s.key)} aria-label={`Show ${s.label} slide`} aria-current={active === s.key ? "true" : undefined} className={`h-2.5 rounded-full transition-all ${active === s.key ? "w-8 bg-[var(--signal)]" : "w-2.5 bg-[var(--line)] hover:bg-[var(--line-strong)]"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
