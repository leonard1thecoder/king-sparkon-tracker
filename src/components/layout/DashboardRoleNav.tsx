"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { BarChart3, Boxes, BriefcaseBusiness, Building2, CreditCard, FileCheck2, Megaphone, QrCode, ScanLine, Settings, ShieldCheck, ShoppingCart, Ticket, UserRound, UsersRound, WalletCards } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { UserRole } from "@/lib/types/backend";

type NavItem = { label: string; href: string; icon: LucideIcon };

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
    { label: "Profile", href: "/dashboard/admin/profile", icon: UserRound },
  ],
  Owner: [
    { label: "Overview", href: "/dashboard/owner", icon: Building2 },
    { label: "Products", href: "/dashboard/owner/products", icon: Boxes },
    { label: "Tuck Shop", href: "/dashboard/owner/products", icon: ShoppingCart },
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
    { label: "Profile", href: "/dashboard/owner/profile", icon: UserRound },
  ],
  Worker: [
    { label: "Overview", href: "/dashboard/worker", icon: UserRound },
    { label: "Scan Products", href: "/dashboard/worker/scan", icon: ScanLine },
    { label: "Ticket Scan", href: "/dashboard/worker/tickets/scan", icon: QrCode },
    { label: "Transactions", href: "/dashboard/worker/transactions", icon: CreditCard },
    { label: "Tips", href: "/dashboard/worker/tips", icon: WalletCards },
    { label: "Profile", href: "/dashboard/worker/profile", icon: Settings },
  ],
  Affiliate: [
    { label: "Overview", href: "/dashboard/affiliate", icon: QrCode },
    { label: "Referral Links", href: "/dashboard/affiliate/referrals", icon: QrCode },
    { label: "Campaign Assets", href: "/dashboard/affiliate/assets", icon: Megaphone },
    { label: "Commissions", href: "/dashboard/affiliate/commissions", icon: BarChart3 },
    { label: "Payouts", href: "/dashboard/affiliate/payouts", icon: WalletCards },
    { label: "Profile", href: "/dashboard/affiliate/profile", icon: Settings },
  ],
  User: [
    { label: "Buy Products", href: "/dashboard/user/shop", icon: ShoppingCart },
    { label: "Buy Tickets", href: "/dashboard/user/tickets/buy", icon: Ticket },
    { label: "Tip Worker", href: "/dashboard/user/tips/scan", icon: WalletCards },
    { label: "Profile", href: "/dashboard/user/profile", icon: UserRound },
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
    return pathname === cleanHref || pathname.startsWith("/dashboard/user/shop/products");
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
      {items.map(({ label, href, icon: Icon }) => {
        const active = isActive(pathname, searchParams, href);
        return (
          <Link
            key={`${role}-${href}-${label}`}
            href={href}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-black transition lg:w-full lg:rounded-[1.15rem]",
              active
                ? "border-[var(--gold)] bg-white text-[var(--ink)] shadow-[var(--shadow-soft)]"
                : "border-white/10 bg-white/[0.04] text-white/68 hover:border-[var(--gold)] hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className={cn("h-4 w-4", active ? "text-[var(--signal)]" : "text-[var(--gold)]")} />
            <span>{label}</span>
          </Link>
        );
      })}
    </>
  );
}
