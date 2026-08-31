import Image from "next/image";
import Link from "next/link";
import { UserAwareDashboardHeaderActions } from "@/components/layout/UserAwareDashboardHeaderActions";

function dashboardHomeHref(role: string) {
  const v = role.toLowerCase();
  if (v.includes("admin")) return "/dashboard/admin/capacity";
  if (v.includes("owner")) return "/dashboard/owner/products";
  if (v.includes("worker")) return "/dashboard/worker/scan";
  if (v.includes("affiliate")) return "/dashboard/affiliate/referrals";
  if (v.includes("artist")) return "/dashboard/artist";
  return "/dashboard/user/shop";
}

export function DashboardHeader({ title, description, role }: { title: string; description: string; role: string }) {
  return (
    <header className="sticky top-0 z-20 hidden h-16 items-center border-b border-[var(--line)] bg-white/95 backdrop-blur-md px-5 shadow-[var(--shadow-xs)] md:px-8 lg:flex">
      <div className="flex w-full items-center justify-between gap-4">
        <Link href={dashboardHomeHref(role)} className="flex min-w-0 items-center gap-3">
          <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker" width={40} height={40} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-1 shrink-0" priority />
          <div className="min-w-0">
            <p className="truncate text-[0.62rem] font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">King Sparkon</p>
            <p className="truncate text-sm font-black tracking-[-0.02em]">Tracker</p>
          </div>
        </Link>
        <UserAwareDashboardHeaderActions role={role} />
      </div>
    </header>
  );
}
