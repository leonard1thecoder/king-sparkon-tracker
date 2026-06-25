import { AlertTriangle, BarChart3, Boxes, Building2, ScanLine, Warehouse } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StatusPill } from "@/components/ui/StatusPill";
import { ProductTable, type InventoryProduct } from "@/components/inventory/ProductTable";

type Role = "Owner" | "Worker" | "Affiliate" | "Admin";

const roleCopy: Record<Role, { title: string; description: string }> = {
  Owner: {
    title: "Owner operations console",
    description: "Track products, scan activity, low-stock alerts, payments, tips, withdrawals, promotions, and audit signals from one clean workspace.",
  },
  Worker: {
    title: "Worker scan terminal",
    description: "Scan items, verify products, register barcodes, create transactions, and keep every stock movement clean at the source.",
  },
  Affiliate: {
    title: "Affiliate referral console",
    description: "Manage referral links, QR previews, onboarding, commissions, payouts, marketing assets, and performance from a focused dashboard.",
  },
  Admin: {
    title: "Platform oversight console",
    description: "Review users, businesses, promotions, scan logs, subscriber growth, feature policy, and platform health without clutter.",
  },
};

const products: InventoryProduct[] = [
  { barcode: "KST-6001234567890", name: "Sparkon Premium Lager", location: "Warehouse A", quantity: 184, status: "Healthy", lastScanned: "2 min ago" },
  { barcode: "KST-6001234567814", name: "Returnable Bottle Crate", location: "Counter 02", quantity: 18, status: "Low stock", lastScanned: "11 min ago" },
  { barcode: "KST-6001234567838", name: "Promotion QR Card", location: "Promo Desk", quantity: 72, status: "Review", lastScanned: "24 min ago" },
  { barcode: "KST-6001234567883", name: "Worker Tip QR Stand", location: "Front till", quantity: 46, status: "Healthy", lastScanned: "41 min ago" },
];

const activity = [
  ["SELL", "Sparkon Premium Lager", "Worker terminal verified 3 item barcodes", "2 min ago", "confirm"],
  ["LOW", "Returnable Bottle Crate", "Quantity dropped below branch threshold", "11 min ago", "signal"],
  ["PAY", "Website payment", "Payment link generated for customer checkout", "18 min ago", "neutral"],
  ["TIP", "Worker QR tip", "Tip request created and assigned to owner review", "27 min ago", "confirm"],
] as const;

export function DashboardShell({ role }: { role: Role }) {
  const copy = roleCopy[role];

  return (
    <>
      <DashboardHeader role={role} title={copy.title} description={copy.description} />
      <main className="grid gap-6 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Total products" value="18,420" detail="Verified inventory records" tone="confirm" icon={<Boxes className="h-5 w-5" />} />
          <MetricCard label="Total scans" value="426K" detail="Barcode and QR events" tone="signal" icon={<ScanLine className="h-5 w-5" />} />
          <MetricCard label="Low stock alerts" value="07" detail="Needs owner attention" icon={<AlertTriangle className="h-5 w-5" />} />
          <MetricCard label="Active branches" value="12" detail="Warehouses and counters" icon={<Warehouse className="h-5 w-5" />} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.45fr_0.85fr]">
          <section className="grid gap-4">
            <SectionHeader
              eyebrow="Inventory status"
              title="Products that need operational visibility."
              description="Readable tables on desktop, clean cards on mobile, and status badges operators can understand immediately."
            />
            <ProductTable products={products} />
          </section>

          <section className="grid gap-4">
            <SectionHeader eyebrow="Live activity" title="Recent scan movement." />
            <Card>
              <CardHeader>
                <CardTitle>Operational feed</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3">
                {activity.map(([code, title, detail, time, tone]) => (
                  <article key={`${code}-${time}`} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
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

        <div className="grid gap-4 lg:grid-cols-3">
          {[
            [Building2, "Branch readiness", "Mobile-friendly stock views for warehouses, shelves, counters, and delivery points."],
            [BarChart3, "Reporting clarity", "Inventory totals, scan movement, payment visibility, and audit signals stay grouped."],
            [ScanLine, "Scanner-first UX", "The scan flow now has a real camera frame, manual fallback, and clear verification output."],
          ].map(([Icon, title, description]) => (
            <Card key={title} className="p-5">
              <Icon className="h-6 w-6 text-[var(--signal)]" />
              <h3 className="mt-5 text-xl font-black tracking-[-0.03em]">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{description}</p>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
