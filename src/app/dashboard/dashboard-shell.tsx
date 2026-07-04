import Link from "next/link";
import { ArrowRight, Boxes, BriefcaseBusiness, Building2, CreditCard, QrCode, ScanLine, ShieldCheck, ShoppingCart, Ticket, UserRound, WalletCards } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { OwnerTuckShopProductManager } from "@/components/tuck-shop/OwnerTuckShopProductManager";
import { TuckShopDashboard } from "@/components/tuck-shop/TuckShopDashboard";
import { WorkerTuckShopBarcodeCheckout } from "@/components/tuck-shop/WorkerTuckShopBarcodeCheckout";
import type { UserRole } from "@/lib/types/backend";

type Role = UserRole;

type Action = { label: string; href: string; detail: string; tone?: "neutral" | "signal" | "confirm" };

const overview: Record<Role, { title: string; description: string; primary: Action; secondary: Action; metrics: Array<{ label: string; value: string; detail: string; tone?: "neutral" | "signal" | "confirm" }>; actions: Action[] }> = {
  Admin: {
    title: "Platform oversight console",
    description: "Admin should review users, businesses, tickets, promotions, reports and platform settings from one controlled workspace. No public ticket demo redirects.",
    primary: { label: "Review users", href: "/dashboard/admin/users", detail: "Verification, roles and account state.", tone: "signal" },
    secondary: { label: "Ticket oversight", href: "/dashboard/admin/tickets", detail: "Events, capacity and scan control.", tone: "confirm" },
    metrics: [
      { label: "UX routing", value: "Fixed", detail: "Tickets stay inside /dashboard/admin/tickets.", tone: "confirm" },
      { label: "Nav source", value: "One", detail: "Admin nav now shares the role-aware dashboard nav.", tone: "signal" },
      { label: "Profile", value: "Ready", detail: "Session profile and logout are available." },
    ],
    actions: [
      { label: "Businesses", href: "/dashboard/admin/businesses", detail: "Plan, billing policy and operational status.", tone: "signal" },
      { label: "Reports", href: "/dashboard/admin/reports", detail: "Platform reporting and audit signals." },
      { label: "Settings", href: "/dashboard/admin/settings", detail: "Policy, role and platform configuration." },
    ],
  },
  Owner: {
    title: "Owner operations console",
    description: "Owner should see products, workers, transactions, tips, tickets, jobs, promotions, reports and billing without leaving the dashboard shell.",
    primary: { label: "Manage products", href: "/dashboard/owner/products", detail: "Live product API, images and Tuck Shop readiness.", tone: "confirm" },
    secondary: { label: "Owner tickets", href: "/dashboard/owner/tickets", detail: "Event setup and QR ticket operations.", tone: "signal" },
    metrics: [
      { label: "Products", value: "Live API", detail: "Owner products use the existing product backend.", tone: "confirm" },
      { label: "Tickets", value: "Internal", detail: "Owner ticket UX no longer jumps to /tickets.", tone: "signal" },
      { label: "Session", value: "Logout", detail: "Owner can sign out from the shell." },
    ],
    actions: [
      { label: "Transactions", href: "/dashboard/owner/transactions", detail: "Payment URLs, references and statuses.", tone: "signal" },
      { label: "Tips", href: "/dashboard/owner/tips", detail: "Worker tips, fees and withdrawals." },
      { label: "Billing", href: "/dashboard/owner/billing", detail: "Plan and subscription state." },
    ],
  },
  Worker: {
    title: "Worker scan terminal",
    description: "Worker UX should prioritize scanning, checkout, ticket verification, transactions, tips and profile. Keep it fast and task-first.",
    primary: { label: "Start product scan", href: "/dashboard/worker/scan", detail: "Camera scanner and manual barcode fallback.", tone: "confirm" },
    secondary: { label: "Scan ticket QR", href: "/dashboard/worker/tickets/scan", detail: "Gate verification inside worker dashboard.", tone: "signal" },
    metrics: [
      { label: "Task", value: "Scan", detail: "Primary worker action is visible immediately.", tone: "confirm" },
      { label: "Ticket route", value: "Fixed", detail: "No public /tickets jump from worker nav.", tone: "signal" },
      { label: "Profile", value: "Ready", detail: "Worker account page is implemented." },
    ],
    actions: [
      { label: "Transactions", href: "/dashboard/worker/transactions", detail: "Worker transaction history.", tone: "signal" },
      { label: "Tips", href: "/dashboard/worker/tips", detail: "Tip status and payout context." },
      { label: "Profile", href: "/dashboard/worker/profile", detail: "Identity, business assignment and logout." },
    ],
  },
  Affiliate: {
    title: "Affiliate referral console",
    description: "Affiliate UX should make referral links, campaign assets, commissions, payouts and profile obvious from the first screen.",
    primary: { label: "Referral links", href: "/dashboard/affiliate/referrals", detail: "Copy link and QR preview.", tone: "signal" },
    secondary: { label: "Payouts", href: "/dashboard/affiliate/payouts", detail: "Payout status and payment profile.", tone: "confirm" },
    metrics: [
      { label: "Referral", value: "Link + QR", detail: "The first action is sharing assets.", tone: "signal" },
      { label: "Commission", value: "Ledger", detail: "Earnings status belongs in the dashboard.", tone: "confirm" },
      { label: "Profile", value: "Ready", detail: "Affiliate can inspect profile and logout." },
    ],
    actions: [
      { label: "Campaign assets", href: "/dashboard/affiliate/assets", detail: "WhatsApp and social material.", tone: "signal" },
      { label: "Commissions", href: "/dashboard/affiliate/commissions", detail: "Pending, approved and paid." },
      { label: "Profile", href: "/dashboard/affiliate/profile", detail: "PayPal and account identity." },
    ],
  },
  User: {
    title: "User Tuck Shop, tickets and applications",
    description: "User UX is buying products, checking QR tickets, tracking job applications and managing profile. It must not look like an owner dashboard.",
    primary: { label: "Browse Tuck Shop", href: "/dashboard/user/shop", detail: "Products, cart and payment links.", tone: "signal" },
    secondary: { label: "My tickets", href: "/dashboard/user/tickets", detail: "Purchased QR tickets inside user dashboard.", tone: "confirm" },
    metrics: [
      { label: "Shop", value: "Browse", detail: "User shop uses the Tuck Shop flow.", tone: "signal" },
      { label: "Tickets", value: "Internal", detail: "User tickets live at /dashboard/user/tickets.", tone: "confirm" },
      { label: "Profile", value: "Ready", detail: "User profile and logout are reachable." },
    ],
    actions: [
      { label: "Jobs", href: "/dashboard/user/jobs", detail: "Browse job opportunities.", tone: "signal" },
      { label: "Applications", href: "/dashboard/user/applications", detail: "Track submitted applications." },
      { label: "Profile", href: "/dashboard/user/profile", detail: "Address, contact and session." },
    ],
  },
};

const roleIcons: Record<Role, typeof ShieldCheck> = {
  Admin: ShieldCheck,
  Owner: Building2,
  Worker: ScanLine,
  Affiliate: QrCode,
  User: UserRound,
};

function ActionCard({ action }: { action: Action }) {
  return (
    <Link href={action.href} className="group rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]">
      <div className="flex items-start justify-between gap-4">
        <StatusPill label={action.label} tone={action.tone ?? "neutral"} />
        <ArrowRight className="h-5 w-5 text-[var(--signal)] group-hover:text-[var(--ember)]" />
      </div>
      <p className="mt-4 text-sm leading-6 text-[var(--steel)]">{action.detail}</p>
    </Link>
  );
}

export function DashboardShell({ role }: { role: Role }) {
  const copy = overview[role];
  const Icon = roleIcons[role];

  return (
    <>
      <DashboardHeader role={role.toUpperCase()} title={copy.title} description={copy.description} />
      <main className="grid gap-7 bg-[var(--surface)] p-5 md:p-8">
        <section className="grid gap-6 rounded-[2.5rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7 xl:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] bg-[var(--ink)] p-6 text-white enterprise-grid md:p-8">
            <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">{role} workspace plan</p>
            <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-0.05em] md:text-5xl">{copy.description}</h2>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <ActionCard action={copy.primary} />
              <ActionCard action={copy.secondary} />
            </div>
          </div>
          <div className="grid gap-4">
            {copy.metrics.map((metric) => <MetricCard key={metric.label} {...metric} icon={<Icon className="h-5 w-5" />} />)}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {copy.actions.map((action) => <ActionCard key={action.href} action={action} />)}
        </section>

        {role === "User" ? <TuckShopDashboard compact /> : null}
        {role === "Owner" ? <OwnerTuckShopProductManager /> : null}
        {role === "Worker" ? <WorkerTuckShopBarcodeCheckout /> : null}
      </main>
    </>
  );
}
