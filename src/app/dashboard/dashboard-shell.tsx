import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";

type Role = "Owner" | "Worker" | "Affiliate" | "Admin";

const roleCopy: Record<Role, { title: string; description: string; metrics: Array<[string, string, string]> }> = {
  Owner: {
    title: "Owner operations ledger",
    description: "Business products, workers, transactions, tips, withdrawals, promotions, reports, audit logs, and billing are split into dedicated routes.",
    metrics: [["Workers", "Plan policy", "Free Trial 2, Plus 5, Pro unlimited"], ["Tips", "Pro feature", "Backend controls access"], ["Payments", "Website link", "Stripe URL and reference returned by API"]],
  },
  Worker: {
    title: "Worker scan terminal",
    description: "Scan, barcode registration, multi-line checkout, tip links, QR cards, and returnable claims stay worker focused.",
    metrics: [["Scanner", "ZXing", "Camera barcode and QR support"], ["Checkout", "Multi-line", "SELL validates barcode quantity"], ["Tips", "QR/link", "Create worker tip payment request"]],
  },
  Affiliate: {
    title: "Affiliate referral ledger",
    description: "Referral code, promotion link, QR preview, onboarding, commissions, payouts, marketing assets, and performance live in affiliate routes.",
    metrics: [["Referral", "Code/link", "Copy and QR preview"], ["Commission", "Summary", "Backend payout source of truth"], ["Assets", "Campaign", "Marketing materials and tracking"]],
  },
  Admin: {
    title: "Platform oversight console",
    description: "Admin pages separate users, businesses, registered-subscriber promotions, scan logs, and settings without copying owner dashboards.",
    metrics: [["Users", "Oversight", "Role and verification view"], ["Businesses", "Policy", "Plan and feature state"], ["Promotions", "Registered", "Campaign controls"]],
  },
};

export function DashboardShell({ role }: { role: Role }) {
  const copy = roleCopy[role];

  return (
    <>
      <DashboardHeader role={role} title={copy.title} description={copy.description} />
      <main className="grid gap-5 p-5 md:p-8">
        <div className="grid gap-4 md:grid-cols-3">
          {copy.metrics.map(([label, value, detail]) => <MetricCard key={label} label={label} value={value} detail={detail} />)}
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Role routes active</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <StatusPill label="SPLIT" tone="confirm" />
            <p className="text-sm leading-6 text-[var(--steel)]">The legacy dashboard file now serves only as a small compatibility entry. New work should use role layouts, role nav, domain API modules, scanner components, and focused route pages.</p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
