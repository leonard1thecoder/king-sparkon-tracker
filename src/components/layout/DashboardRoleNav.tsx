"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  CreditCard,
  FileCheck2,
  Megaphone,
  QrCode,
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

type NavItem = { label: string; href: string; icon: LucideIcon; description?: string };

const navByRole: Record<UserRole, NavItem[]> = {
  Admin: [
    { label: "Overview", href: "/dashboard/admin", icon: ShieldCheck },
    { label: "Users", href: "/dashboard/admin/users", icon: UsersRound },
    { label: "Businesses", href: "/dashboard/admin/businesses", icon: Building2 },
    { label: "Products", href: "/dashboard/admin/products", icon: Boxes },
    { label: "Tickets", href: "/dashboard/admin/tickets", icon: Ticket },
    { label: "Promotions", href: "/dashboard/admin/promotions", icon: Megaphone },
    { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  Owner: [
    { label: "Overview", href: "/dashboard/owner", icon: Building2 },
    { label: "Products", href: "/dashboard/owner/products", icon: Boxes },
    { label: "Workers", href: "/dashboard/owner/workers", icon: UsersRound },
    { label: "Transactions", href: "/dashboard/owner/transactions", icon: CreditCard },
    { label: "Tips", href: "/dashboard/owner/tips", icon: WalletCards },
    { label: "Tickets", href: "/dashboard/owner/tickets", icon: Ticket },
    { label: "Jobs", href: "/dashboard/owner/jobs", icon: BriefcaseBusiness },
    { label: "Applications", href: "/dashboard/owner/jobs?tab=applications", icon: FileCheck2 },
    { label: "Promotions", href: "/dashboard/owner/promotions", icon: Megaphone },
    { label: "Reports", href: "/dashboard/owner/reports", icon: BarChart3 },
    { label: "Billing", href: "/dashboard/owner/billing", icon: CreditCard },
    { label: "Settings", href: "/dashboard/owner/settings", icon: Settings },
  ],
  Worker: [
    { label: "Overview", href: "/dashboard/worker", icon: UserRound, description: "Worker activity" },
    { label: "Products", href: "/dashboard/worker/products", icon: Boxes, description: "Business stock catalogue" },
    { label: "Scan & Sell", href: "/dashboard/worker/scan", icon: ScanLine, description: "Barcode checkout" },
    { label: "Product Sales", href: "/dashboard/worker/transactions", icon: CreditCard, description: "Worker transaction history" },
    { label: "Ticket Scan", href: "/dashboard/worker/tickets/scan", icon: QrCode, description: "Validate event tickets" },
    { label: "Tips", href: "/dashboard/worker/tips", icon: WalletCards, description: "Tip earnings" },
    { label: "Jobs", href: "/dashboard/worker/jobs", icon: BriefcaseBusiness },
    { label: "Applications", href: "/dashboard/worker/applications", icon: FileCheck2 },
    { label: "Profile", href: "/dashboard/worker/profile", icon: Settings },
  ],
  Affiliate: [
    { label: "Overview", href: "/dashboard/affiliate", icon: QrCode, description: "Funnel and earnings" },
    { label: "Referral Links", href: "/dashboard/affiliate/referrals", icon: QrCode, description: "Share link and QR" },
    { label: "Campaign Assets", href: "/dashboard/affiliate/assets", icon: Megaphone, description: "Copy-ready promotion" },
    { label: "Commissions", href: "/dashboard/affiliate/commissions", icon: BarChart3, description: "Earned value ledger" },
    { label: "Payouts", href: "/dashboard/affiliate/payouts", icon: WalletCards, description: "Provider settlements" },
  ],
  User: [
    { label: "Buy Products", href: "/dashboard/user/shop", icon: ShoppingCart },
    { label: "Cart", href: "/dashboard/user/shop/cart", icon: ShoppingCart },
    { label: "Buy Tickets", href: "/dashboard/user/tickets/buy", icon: Ticket },
    { label: "Tip Worker", href: "/dashboard/user/tips/scan", icon: WalletCards },
  ],
};

function isDashboardRoot(cleanHref: string) {
  return /^\/dashboard\/[^/]+$/.test(cleanHref);
}

function isActive(pathname: string, searchParams: URLSearchParams, href: string) {
  const [cleanHref, query = ""] = href.split("?");

  if (query) {
    const hrefParams = new URLSearchParams(query);
    return pathname === cleanHref && Array.from(hrefParams.entries()).every(([key, value]) => searchParams.get(key) === value);
  }

  if (cleanHref === "/dashboard/user/shop") {
    return pathname === cleanHref || pathname.startsWith("/dashboard/user/shop/products") || pathname.startsWith("/dashboard/user/shop/all");
  }

  if (cleanHref === "/dashboard/user/shop/cart") {
    return pathname === cleanHref || pathname.startsWith("/dashboard/user/carts");
  }

  if (cleanHref === "/dashboard/user/tickets/buy") {
    return pathname === cleanHref || pathname.startsWith("/dashboard/user/tickets/events") || pathname.startsWith("/dashboard/user/tickets/checkout");
  }

  if (isDashboardRoot(cleanHref)) {
    return pathname === cleanHref && !searchParams.has("tab");
  }

  if (pathname !== cleanHref && !pathname.startsWith(`${cleanHref}/`)) {
    return false;
  }

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
          <Link
            key={`${role}-${href}-${label}`}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "group inline-flex min-h-11 w-full shrink-0 items-center gap-3 rounded-[1rem] border px-3.5 py-2.5 text-sm font-black transition duration-200 ease-out hover:-translate-y-0.5",
              description ? "min-h-[3.65rem]" : "",
              active
                ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-[0_12px_24px_rgba(7,19,31,0.2)]"
                : "border-[var(--ink)]/10 bg-white/45 text-[var(--ink)]/75 hover:border-[var(--ink)]/25 hover:bg-white/75 hover:text-[var(--ink)]",
            )}
          >
            <span
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-[0.8rem] border transition-colors",
                active
                  ? "border-white/15 bg-white/10 text-[var(--gold)]"
                  : "border-[var(--ink)]/10 bg-white/55 text-[var(--signal)] group-hover:text-[var(--ink)]",
              )}
            >
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate">{label}</span>
              {description ? <span className={cn("mt-0.5 block truncate text-[0.65rem] font-bold tracking-normal", active ? "text-white/55" : "text-[var(--muted)]")}>{description}</span> : null}
            </span>
          </Link>
        );
      })}
    </>
  );
}
