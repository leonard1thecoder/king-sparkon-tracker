import { AlertTriangle, BarChart3, Boxes, Building2, CreditCard, Megaphone, ScanLine, ShieldCheck, ShoppingCart, Store, Ticket, UsersRound, WalletCards, Warehouse } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProductTable, type InventoryProduct } from "@/components/inventory/ProductTable";
import { OwnerTuckShopProductManager } from "@/components/tuck-shop/OwnerTuckShopProductManager";
import { TuckShopDashboard } from "@/components/tuck-shop/TuckShopDashboard";
import { WorkerTuckShopBarcodeCheckout } from "@/components/tuck-shop/WorkerTuckShopBarcodeCheckout";

type Role = "Owner" | "Worker" | "Affiliate" | "Admin" | "User";

const roleCopy: Record<Role, { title: string; description: string; primary: string; secondary: string }> = {
  Owner: {
    title: "Owner operations console",
    description: "Track products, tuck shop photos, scan activity, low-stock alerts, payments, tips, withdrawals, promotions, and audit signals from one clean workspace.",
    primary: "Business command center",
    secondary: "Stock, tuck shop products, workers, payments, tips, tickets, and reports stay grouped for daily owner decisions.",
  },
  Worker: {
    title: "Worker scan terminal",
    description: "Scan items, verify products, register barcodes, create transactions, process tuck shop purchases, and keep every stock movement clean at the source.",
    primary: "Fast scanning workspace",
    secondary: "The worker view keeps barcode capture, tuck shop checkout, fallback entry, and verification status obvious on mobile.",
  },
  Affiliate: {
    title: "Affiliate referral console",
    description: "Manage referral links, QR previews, onboarding, commissions, payouts, marketing assets, and performance from a focused dashboard.",
    primary: "Referral growth workspace",
    secondary: "Campaign links, QR assets, commission rules, and payout state are visible without hunting.",
  },
  Admin: {
    title: "Platform oversight console",
    description: "Review users, businesses, tuck shop adoption, promotions, scan logs, subscriber growth, feature policy, and platform health without clutter.",
    primary: "Platform quality cockpit",
    secondary: "Admin gets a clean system overview for users, companies, scan logs, policies, shop readiness, and health checks.",
  },
  User: {
    title: "King Sparkon Tuck Shop",
    description: "Browse products from registered businesses, checkout with Stripe, and optionally tip workers without needing a worker to start the purchase.",
    primary: "Buyer marketplace",
    secondary: "Users can buy available products directly while every purchase still creates barcode-backed transactions for the business.",
  },
};

const previewProducts: InventoryProduct[] = [
  { barcode: "KST-6001234567890", name: "Sparkon Premium Lager", location: "Warehouse A", quantity: 184, status: "Healthy", lastScanned: "2 min ago" },
  { barcode: "KST-6001234567814", name: "Returnable Bottle Crate", location: "Counter 02", quantity: 18, status: "Low stock", lastScanned: "11 min ago" },
  { barcode: "KST-6001234567838", name: "Promotion QR Card", location: "Promo Desk", quantity: 72, status: "Review", lastScanned: "24 min ago" },
  { barcode: "KST-6001234567883", name: "Worker Tip QR Stand", location: "Front till", quantity: 46, status: "Healthy", lastScanned: "41 min ago" },
];

const previewActivity = [
  ["SELL", "Sparkon Premium Lager", "Preview event: worker terminal verified 3 item barcodes", "2 min ago", "confirm"],
  ["SHOP", "Tuck Shop checkout", "Preview event: user self-service payment link generated", "5 min ago", "signal"],
  ["LOW", "Returnable Bottle Crate", "Preview event: quantity dropped below branch threshold", "11 min ago", "signal"],
  ["PAY", "Website payment", "Preview event: payment link generated for customer checkout", "18 min ago", "neutral"],
  ["TIP", "Worker QR tip", "Preview event: tip request created and assigned to owner review", "27 min ago", "confirm"],
] as const;

const featureCards = [
  [Building2, "Branch readiness", "Mobile-friendly stock views for warehouses, shelves, counters, delivery points, and tuck shop storefronts."],
  [Store, "Tuck Shop marketplace", "Product photos, live availability, self-service checkout, and barcode-backed sales stay tied to inventory."],
  [BarChart3, "Reporting clarity", "Inventory totals, scan movement, product payments, tips, and audit signals stay grouped."],
] as const;

const operationalModules = [
  [Store, "Tuck Shop", "Business products in one marketplace with product photos, self-service checkout, and barcode-backed transactions."],
  [Ticket, "QR tickets", "Capacity, sold seats, class sales, issued tickets, and gate verification."],
  [WalletCards, "Worker tips", "Gross tips, platform fee, net payout, QR links, and owner review state."],
  [Megaphone, "Promotions", "Audience, campaign channel, quote visibility, subscribers, and launch state."],
  [CreditCard, "Transactions", "BUY/SELL activity, payment URLs, references, methods, and statuses."],
  [UsersRound, "People", "Owner, worker, affiliate, buyer, and admin flows stay role-aware."],
] as const;

export function DashboardShell({ role }: { role: Role }) {
  const copy = roleCopy[role];

  return (
    <>
      <DashboardHeader role={role} title={copy.title} description={copy.description} />
      <main className="grid gap-7 bg-[var(--surface)] p-5 md:p-8">
        <section className="grid gap-6 rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between gap-8 rounded-[2rem] bg-[var(--ink)] p-6 text-white shadow-[var(--shadow-depth)] enterprise-grid md:p-8">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{copy.primary}</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-black tracking-[-0.05em] md:text-5xl">Dashboard polish for serious barcode operations.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">{copy.secondary}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Real-time scans", "Tuck Shop checkout", "Audit-ready reports"].map((item) => (
                <div key={item} className="rounded-[1.35rem] border border-white/10 bg-white/[0.06] p-4 text-sm font-black text-white/78 backdrop-blur">
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <MetricCard label="Preview products" value="18,420" detail="Demo value until product API is connected" tone="confirm" icon={<Boxes className="h-5 w-5" />} />
            <MetricCard label="Tuck shop" value="Live API" detail="Products, images, cart, checkout, tips" tone="signal" icon={<ShoppingCart className="h-5 w-5" />} />
            <MetricCard label="Preview low stock" value="07" detail="Demo alerts, not live totals" icon={<AlertTriangle className="h-5 w-5" />} />
            <MetricCard label="Preview branches" value="12" detail="Demo warehouses and counters" icon={<Warehouse className="h-5 w-5" />} />
          </div>
        </section>

        {role === "User" ? <TuckShopDashboard /> : null}
        {role === "Owner" ? <OwnerTuckShopProductManager /> : null}
        {role === "Worker" ? <WorkerTuckShopBarcodeCheckout /> : null}

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <section className="grid gap-4">
            <SectionHeader
              eyebrow="Preview inventory status"
              title="Demo products that show operational visibility."
              description="Static preview data is labelled clearly until backend product, scan, and branch metrics are wired into this shell. No existing dashboard detail was removed."
            />
            <ProductTable products={previewProducts} />
          </section>

          <section className="grid gap-4">
            <SectionHeader eyebrow="Preview activity" title="Demo scan movement." />
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Preview operational feed</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {previewActivity.map(([code, title, detail, time, tone]) => (
                  <article key={`${code}-${time}`} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--gold)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <StatusPill label={code} tone={tone} />
                        <h3 className="mt-3 font-black tracking-[-0.02em] text-[var(--ink)]">{title}</h3>
                      </div>
                      <span className="text-xs font-semibold text-[var(--muted)]">{time}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-[var(--steel)]">{detail}</p>
                  </article>
                ))}
              </CardContent>
            </Card>
          </section>
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          {featureCards.map(([Icon, title, description]) => (
            <Card key={title} className="p-5 hover:-translate-y-1 hover:border-[var(--gold)]">
              <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]"><Icon className="h-6 w-6" /></div>
              <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{description}</p>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] md:p-7 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--signal)]">Operational modules</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">Everything remains visible.</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--steel)]">Inventory, tuck shop, ticketing, tips, promotions, transactions, people, and audit history keep their place in the UI.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:col-span-2 xl:grid-cols-3">
            {operationalModules.map(([Icon, title, description]) => (
              <article key={title} className="rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 hover:border-[var(--gold)]">
                <Icon className="h-5 w-5 text-[var(--signal)]" />
                <h3 className="mt-4 font-black tracking-[-0.02em]">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--steel)]">{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
