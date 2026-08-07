"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BadgePercent,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  ClipboardList,
  Code2,
  CreditCard,
  FileCheck2,
  Gauge,
  Handshake,
  Landmark,
  Megaphone,
  PackageSearch,
  QrCode,
  ReceiptText,
  ScanLine,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/lib/types/backend";

export type NavItem = { label: string; href: string; icon: LucideIcon; description?: string; shortLabel?: string };

export const navByRole: Record<UserRole, NavItem[]> = {
  Admin: [
    { label: "Capacity", href: "/dashboard/admin/capacity", icon: Gauge, description: "Users, stock and system scale", shortLabel: "Capacity" },
    { label: "Users", href: "/dashboard/admin/users", icon: UsersRound, description: "Accounts, roles and access", shortLabel: "Users" },
    { label: "Businesses", href: "/dashboard/admin/businesses", icon: Building2, description: "Owners, plans and status", shortLabel: "Businesses" },
    { label: "Products", href: "/dashboard/admin/products", icon: Boxes, description: "Catalogue moderation", shortLabel: "Products" },
    { label: "Tickets", href: "/dashboard/admin/tickets", icon: Ticket, description: "Events, sales and verification", shortLabel: "Tickets" },
    { label: "Jobs", href: "/dashboard/admin/jobs", icon: BriefcaseBusiness, description: "Platform opportunities", shortLabel: "Jobs" },
    { label: "Applications", href: "/dashboard/admin/jobs?tab=applications", icon: FileCheck2, description: "Applicant review queue", shortLabel: "Apps" },
    { label: "Affiliates", href: "/dashboard/admin/affiliates", icon: Handshake, description: "Poster uploads and partner tools", shortLabel: "Affiliates" },
    { label: "Tips", href: "/dashboard/admin/tips", icon: WalletCards, description: "Tip payments and activity", shortLabel: "Tips" },
    { label: "Promotions", href: "/dashboard/admin/promotions", icon: Megaphone, description: "Platform campaigns", shortLabel: "Promos" },
    { label: "Services & Discounts", href: "/dashboard/admin/discounts", icon: BadgePercent, description: "Plus and Pro pricing offers", shortLabel: "Discounts" },
    { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3, description: "Platform performance", shortLabel: "Reports" },
    { label: "Audit Logs", href: "/dashboard/admin/audit", icon: ClipboardList, description: "Security and action history", shortLabel: "Audit" },
    { label: "Developer Hub", href: "/dashboard/admin/developer", icon: Code2, description: "Stages and implementation", shortLabel: "Dev" },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings, description: "Platform policy and controls", shortLabel: "Settings" },
    { label: "Profile", href: "/dashboard/admin/profile", icon: UserRound, description: "Account and session", shortLabel: "Profile" },
  ],
  Owner: [
    { label: "Products", href: "/dashboard/owner/products", icon: Boxes, description: "Customer view and stock controls", shortLabel: "Products" },
    { label: "Workers", href: "/dashboard/owner/workers", icon: UsersRound, description: "Accounts and privileges", shortLabel: "Workers" },
    { label: "Product Transactions", href: "/dashboard/owner/transactions", icon: ReceiptText, description: "Cash, card and app purchases", shortLabel: "Sales" },
    { label: "Withdrawals", href: "/dashboard/owner/withdrawals", icon: Landmark, description: "Unified balance and payout history", shortLabel: "Payouts" },
    { label: "Tips", href: "/dashboard/owner/tips", icon: WalletCards, description: "Worker tip activity", shortLabel: "Tips" },
    { label: "Tickets", href: "/dashboard/owner/tickets", icon: Ticket, description: "Events and ticket sales", shortLabel: "Tickets" },
    { label: "Jobs", href: "/dashboard/owner/jobs", icon: BriefcaseBusiness, description: "Business opportunities", shortLabel: "Jobs" },
    { label: "Applications", href: "/dashboard/owner/jobs?tab=applications", icon: FileCheck2, description: "Review job applicants", shortLabel: "Apps" },
    { label: "Promotions", href: "/dashboard/owner/promotions", icon: Megaphone, description: "Subscriber campaigns", shortLabel: "Promos" },
    { label: "Settings", href: "/dashboard/owner/settings", icon: Settings, description: "Business preferences", shortLabel: "Settings" },
    { label: "Profile", href: "/dashboard/owner/profile", icon: UserRound, description: "Identity and session", shortLabel: "Profile" },
  ],
  Worker: [
    { label: "Counter Checkout", href: "/dashboard/worker/scan", icon: ScanLine, description: "Cash or card checkout", shortLabel: "Checkout" },
    { label: "Products & Barcodes", href: "/dashboard/worker/products", icon: Boxes, description: "Stock and automatic codes", shortLabel: "Products" },
    { label: "Online Orders", href: "/dashboard/worker/orders", icon: PackageSearch, description: "Prepare paid carts", shortLabel: "Orders" },
    { label: "Ticket Entry", href: "/dashboard/worker/tickets/scan", icon: QrCode, description: "Face and QR verification", shortLabel: "Tickets" },
    { label: "Product Sales", href: "/dashboard/worker/transactions", icon: CreditCard, description: "Completed carts", shortLabel: "Sales" },
    { label: "Tips & QR", href: "/dashboard/worker/tips", icon: WalletCards, description: "Owner-enabled tips", shortLabel: "Tips" },
    { label: "Profile", href: "/dashboard/worker/profile", icon: UserRound, description: "Identity and business assignment", shortLabel: "Profile" },
  ],
  Affiliate: [
    { label: "Referral Links", href: "/dashboard/affiliate/referrals", icon: QrCode, description: "Tracked link and QR", shortLabel: "Referrals" },
    { label: "Campaign Assets", href: "/dashboard/affiliate/assets", icon: Megaphone, description: "Download approved posters", shortLabel: "Assets" },
    { label: "Commissions", href: "/dashboard/affiliate/commissions", icon: BarChart3, description: "Approved earnings ledger", shortLabel: "Earnings" },
    { label: "Payouts", href: "/dashboard/affiliate/payouts", icon: WalletCards, description: "Cash out and settlements", shortLabel: "Payouts" },
    { label: "Affiliate Leads", href: "/dashboard/affiliate/leads", icon: UsersRound, description: "Subscriber contacts and sales angles", shortLabel: "Leads" },
    { label: "Profile", href: "/dashboard/affiliate/profile", icon: UserRound, description: "Payout identity and session", shortLabel: "Profile" },
  ],
  User: [
    { label: "Buy Products", href: "/dashboard/user/shop", icon: ShoppingCart, description: "Browse the Tuck Shop", shortLabel: "Shop" },
    { label: "Cart", href: "/dashboard/user/shop/cart", icon: ShoppingCart, description: "Review and pay", shortLabel: "Cart" },
    { label: "Buy Tickets", href: "/dashboard/user/tickets/buy", icon: Ticket, description: "Browse live events", shortLabel: "Tickets" },
    { label: "Tip Worker", href: "/dashboard/user/tips", icon: WalletCards, description: "Scan a worker QR", shortLabel: "Tip" },
  ],
};

export function getRoleNavConfig(role: UserRole): { primary: NavItem[]; secondary: NavItem[] } {
  const items = navByRole[role] ?? [];
  const primary = items.slice(0, 4);
  const secondary = items.slice(4);
  return { primary, secondary };
}

function isDashboardRoot(cleanHref: string) {
  return /^\/dashboard\/[^/]+$/.test(cleanHref);
}

export function isActive(pathname: string, searchParams: URLSearchParams, href: string) {
  const [cleanHref, query = ""] = href.split("?");
  if (query) {
    const hrefParams = new URLSearchParams(query);
    return pathname === cleanHref && Array.from(hrefParams.entries()).every(([key, value]) => searchParams.get(key) === value);
  }
  if (cleanHref === "/dashboard/user/shop") return pathname === cleanHref || pathname.startsWith("/dashboard/user/shop/products");
  if (cleanHref === "/dashboard/user/shop/cart") return pathname === cleanHref;
  if (cleanHref === "/dashboard/user/tickets/buy") return pathname === cleanHref || pathname.startsWith("/dashboard/user/tickets/events") || pathname.startsWith("/dashboard/user/tickets/checkout");
  if (cleanHref === "/dashboard/user/tickets") return pathname === cleanHref;
  if (cleanHref === "/dashboard/user/tips") return pathname === cleanHref || pathname.startsWith("/dashboard/user/tips/");
  if (isDashboardRoot(cleanHref)) return pathname === cleanHref && !searchParams.has("tab");
  if (pathname !== cleanHref && !pathname.startsWith(`${cleanHref}/`)) return false;
  return pathname !== cleanHref || !searchParams.has("tab");
}

export function DashboardRoleNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const items = navByRole[role];

  return (
    <>
      {items.map(({ label, href, icon: Icon, description }) => {
        const active = isActive(pathname, searchParams, href);
        return (
          <Link key={`${role}-${href}-${label}`} href={href} aria-current={active ? "page" : undefined} className={cn("group inline-flex min-h-11 w-full shrink-0 items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm font-extrabold transition duration-200 ease-out", description ? "min-h-[3.65rem]" : "", active ? "border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "border-transparent bg-white text-[var(--steel)] hover:border-[var(--line)] hover:text-[var(--ink)]") }>
            <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-[0.8rem] border transition-colors", active ? "border-[var(--line-strong)] bg-white text-[var(--signal-strong)]" : "border-[var(--line)] bg-white text-[var(--signal)] group-hover:border-[var(--line-strong)]")}><Icon className="h-4 w-4" /></span>
            <span className="min-w-0"><span className="block truncate">{label}</span>{description ? <span className={cn("mt-0.5 block truncate text-[0.65rem] font-bold tracking-normal", active ? "text-[var(--signal-strong)]/70" : "text-[var(--muted)]")}>{description}</span> : null}</span>
          </Link>
        );
      })}
    </>
  );
}
