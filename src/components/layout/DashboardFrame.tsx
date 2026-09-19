import Image from "next/image";
import Link from "next/link";
import { type ReactNode } from "react";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { UserAwareDashboardHeaderActions } from "@/components/layout/UserAwareDashboardHeaderActions";

export function getDashboardHomeHref(role: string): string {
  const value = role.toLowerCase();
  if (value.includes("admin")) return "/dashboard/admin";
  if (value.includes("owner")) return "/dashboard/owner";
  if (value.includes("worker")) return "/dashboard/worker";
  if (value.includes("affiliate")) return "/dashboard/affiliate";
  if (value.includes("artist")) return "/dashboard/artist";
  return "/dashboard/user";
}

export function DashboardFrame({ role, nav, children }: { role: string; nav: ReactNode; children: ReactNode }) {
  const dashboardHomeHref = getDashboardHomeHref(role);

  return (
    <div className="flex min-h-dvh min-h-[100dvh] flex-col bg-white text-[var(--ink)] lg:grid lg:h-dvh lg:grid-cols-[272px_minmax(0,1fr)] lg:overflow-hidden">
      {/* Mobile Sticky Header — safe-area aware, uses dvh-aware sticky */}
      <header className="sticky top-0 z-30 flex min-h-[calc(4.25rem+env(safe-area-inset-top))] items-center justify-between gap-3 border-b border-[var(--line)] bg-white/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-[var(--shadow-xs)] backdrop-blur-md supports-[backdrop-filter:blur(12px)]:bg-white/85 lg:hidden">
        <Link href={dashboardHomeHref} className="flex min-w-0 items-center gap-3">
          <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={91} height={40} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-1 shrink-0 object-contain" priority />
          <div className="min-w-0">
            <p className="truncate text-[0.6rem] font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">{role}</p>
            <p className="truncate text-xs font-black tracking-[-0.02em]">King Sparkon</p>
          </div>
        </Link>
        <UserAwareDashboardHeaderActions role={role} />
      </header>

      {/* Desktop Sidebar — dvh-aware, safe-area for iPad notch */}
      <aside className="hidden lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-dvh lg:min-h-dvh lg:w-auto lg:flex-col border-r border-[var(--line)] bg-white pt-[env(safe-area-inset-top)] text-[var(--ink)]">
        <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[var(--line)] px-5">
          <Link href={dashboardHomeHref} className="flex min-w-0 items-center gap-3">
            <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={100} height={44} className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-1 object-contain" />
            <div className="min-w-0">
              <p className="truncate text-[0.65rem] font-extrabold uppercase tracking-[0.14em] text-[var(--signal-strong)]">{role}</p>
              <p className="truncate text-sm font-black tracking-[-0.01em]">King Sparkon</p>
            </div>
          </Link>
          <div className="hidden rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--signal-soft)] px-3 py-1.5 text-[0.66rem] font-extrabold uppercase tracking-[0.1em] text-[var(--signal-strong)] lg:inline-flex">
            Live operations
          </div>
        </div>

        <nav className="grid flex-1 content-start gap-1 overflow-y-auto overscroll-contain p-3">
          {nav}
        </nav>

        <div className="shrink-0 border-t border-[var(--line)] p-4">
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-white p-4">
            <p className="text-[0.68rem] font-extrabold uppercase tracking-[0.1em] text-[var(--steel)]">Scanner health</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-[var(--steel)]">Terminal sync</span>
              <span className="rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--signal-soft)] px-2.5 py-1 text-xs font-extrabold text-[var(--signal-strong)]">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area — flex-1 avoids 100vh trap, dvh-safe, safe-area bottom for bottom nav */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-white pb-[calc(5rem+env(safe-area-inset-bottom))] lg:h-dvh lg:min-h-0 lg:pb-0">
        {children}
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav role={role} />
    </div>
  );
}
