import Image from "next/image";
import Link from "next/link";
import { UserAwareDashboardHeaderActions } from "@/components/layout/UserAwareDashboardHeaderActions";

function dashboardHomeHref(role: string) {
  const v = role.toLowerCase();
  if (v.includes("admin")) return "/dashboard/admin/capacity";
  if (v.includes("owner")) return "/dashboard/owner/products";
  if (v.includes("worker")) return "/dashboard/worker";
  if (v.includes("affiliate")) return "/dashboard/affiliate/referrals";
  if (v.includes("artist")) return "/dashboard/artist";
  return "/dashboard/user/shop";
}

export function DashboardHeader({ title, description, role }: { title: string; description: string; role: string }) {
  return (
    <header className="sticky top-0 z-20 hidden h-14 items-center border-b border-[var(--line)] bg-white/95 backdrop-blur-md px-4 shadow-[var(--shadow-xs)] md:px-6 lg:flex">
      <div className="ops-main flex w-full items-center justify-between gap-3">
        <Link href={dashboardHomeHref(role)} className="flex min-w-0 items-center gap-2">
          <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={140} height={62} className="shrink-0 object-contain" priority />
        </Link>
        <UserAwareDashboardHeaderActions role={role} />
      </div>
    </header>
  );
}
