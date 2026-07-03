"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BarChart3,
  Boxes,
  BriefcaseBusiness,
  Building2,
  Code2,
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

type NavItem = { label: string; href: string; icon: LucideIcon };

const navByRole: Record<UserRole, NavItem[]> = {
  Admin: [
    { label: "Overview", href: "/dashboard/admin", icon: ShieldCheck },
    { label: "Users", href: "/dashboard/admin/users", icon: UsersRound },
    { label: "Businesses", href: "/dashboard/admin/businesses", icon: Building2 },
    { label: "Products", href: "/dashboard/admin/products", icon: Boxes },
    { label: "Tuck Shop", href: "/dashboard/admin/products", icon: ShoppingCart },
    { label: "Tickets", href: "/tickets", icon: Ticket },
    { label: "Capacity", href: "/dashboard/admin/capacity", icon: BarChart3 },
    { label: "Developer Hub", href: "/dashboard/admin/developer", icon: Code2 },
    { label: "Job Opportunities", href: "/dashboard/admin/jobs", icon: BriefcaseBusiness },
    { label: "Applications", href: "/dashboard/admin/jobs?tab=applications", icon: FileCheck2 },
    { label: "Promotions", href: "/dashboard/admin/promotions", icon: Megaphone },
    { label: "Affiliates", href: "/dashboard/admin/affiliates", icon: QrCode },
    { label: "Tips & Withdrawals", href: "/dashboard/admin/tips", icon: WalletCards },
    { label: "Reports", href: "/dashboard/admin/reports", icon: BarChart3 },
    { label: "Audit Logs", href: "/dashboard/admin/audit", icon: Activity },
    { label: "Settings", href: "/dashboard/admin/settings", icon: Settings },
  ],
  Owner: [
    { label: "Overview", href: "/dashboard/owner", icon: Building2 },
    { label: "Products", href: "/dashboard/owner/products", icon: Boxes },
    { label: "Tuck Shop", href: "/dashboard/owner/products", icon: ShoppingCart },
    { label: "Capacity", href: "/dashboard/owner/capacity", icon: BarChart3 },
    { label: "Developer Hub", href: "/dashboard/owner/developer", icon: Code2 },
    { label: "Barcode Scanner", href: "/dashboard/worker/scan", icon: ScanLine },
    { label: "Transactions", href: "/dashboard/owner/transactions", icon: CreditCard },
    { label: "Tickets", href: "/tickets", icon: Ticket },
    { label: "Job Opportunities", href: "/dashboard/owner/jobs", icon: BriefcaseBusiness },
    { label: "Job Applications", href: "/dashboard/owner/jobs?tab=applications", icon: FileCheck2 },
    { label: "Workers", href: "/dashboard/owner/workers", icon: UsersRound },
    { label: "Tips & Withdrawals", href: "/dashboard/owner/tips", icon: WalletCards },
    { label: "Promotions", href: "/dashboard/owner/promotions", icon: Megaphone },
    { label: "Affiliates", href: "/dashboard/owner/affiliates", icon: QrCode },
    { label: "Reports", href: "/dashboard/owner/reports", icon: BarChart3 },
    { label: "Settings", href: "/dashboard/owner/settings", icon: Settings },
  ],
  Worker: [
    { label: "Overview", href: "/dashboard/worker", icon: UserRound },
    { label: "Scan Products", href: "/dashboard/worker/scan", icon: ScanLine },
    { label: "Tuck Shop Checkout", href: "/dashboard/worker/scan", icon: ShoppingCart },
    { label: "Scan Tickets", href: "/tickets/scan", icon: Ticket },
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
    { label: "Overview", href: "/dashboard/user", icon: UserRound },
    { label: "Tuck Shop", href: "/dashboard/user", icon: ShoppingCart },
    { label: "Tickets", href: "/tickets", icon: Ticket },
    { label: "My Tickets", href: "/dashboard/user/tickets", icon: QrCode },
    { label: "Job Opportunities", href: "/dashboard/user/jobs", icon: BriefcaseBusiness },
    { label: "My Applications", href: "/dashboard/user/applications", icon: FileCheck2 },
    { label: "Profile", href: "/dashboard/user/profile", icon: Settings },
  ],
};

function isActive(pathname: string, href: string) {
  const cleanHref = href.split("?")[0];
  if (cleanHref === "/tickets") return pathname === "/tickets" || pathname.startsWith("/tickets/");
  return pathname === cleanHref || pathname.startsWith(`${cleanHref}/`);
}

export function DashboardRoleNav({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const items = navByRole[role];
  return <>{items.map(({ label, href, icon: Icon }) => { const active = isActive(pathname, href); return <Link key={`${role}-${href}-${label}`} href={href} className={cn("inline-flex min-h-11 shrink-0 items-center gap-3 rounded-full border px-4 py-2 text-sm font-black transition lg:w-full lg:rounded-[1.15rem]", active ? "border-[var(--gold)] bg-white text-[var(--ink)] shadow-[var(--shadow-soft)]" : "border-white/10 bg-white/[0.04] text-white/68 hover:border-[var(--gold)] hover:bg-white/10 hover:text-white")}><Icon className={cn("h-4 w-4", active ? "text-[var(--signal)]" : "text-[var(--gold)]")} /><span>{label}</span></Link>; })}</>;
}
