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
    <div className="ops-density flex min-h-dvh min-h-[100dvh] flex-col bg-white text-[var(--ink)] lg:grid lg:h-dvh lg:grid-cols-[232px_minmax(0,1fr)] lg:overflow-hidden">
      {/* Mobile Sticky Header — safe-area aware, uses dvh-aware sticky */}
      <header className="sticky top-0 z-30 flex min-h-[calc(4.25rem+env(safe-area-inset-top))] items-center justify-between gap-3 border-b border-[var(--line)] bg-white/95 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] shadow-[var(--shadow-xs)] backdrop-blur-md supports-[backdrop-filter:blur(12px)]:bg-white/85 lg:hidden">
        <Link href={dashboardHomeHref} className="flex min-w-0 items-center gap-3">
          <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={170} height={75} className="shrink-0 object-contain" priority />
        </Link>
        <UserAwareDashboardHeaderActions role={role} />
      </header>

      {/* Desktop Sidebar — dvh-aware, safe-area for iPad notch */}
      <aside className="hidden lg:sticky lg:top-0 lg:z-30 lg:flex lg:h-dvh lg:min-h-dvh lg:w-auto lg:flex-col border-r border-[var(--line)] bg-white pt-[env(safe-area-inset-top)] text-[var(--ink)]">
        <div className="flex h-14 shrink-0 items-center justify-between gap-2.5 border-b border-[var(--line)] px-3.5">
          <Link href={dashboardHomeHref} className="flex min-w-0 items-center gap-2">
            <Image src="/king-sparkon-logo.svg" alt="King Sparkon logo" width={140} height={62} className="object-contain" />
          </Link>
          <div className="hidden rounded-[var(--radius-sm)] border border-[var(--line)] bg-[var(--signal-soft)] px-2 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[var(--signal-strong)] lg:inline-flex">
            Live
          </div>
        </div>

        <nav className="grid flex-1 content-start gap-0.5 overflow-y-auto overscroll-contain p-2">
          {nav}
        </nav>

        <div className="shrink-0 border-t border-[var(--line)] p-2.5">
          <div className="rounded-[var(--radius-md)] border border-[var(--line)] bg-white p-2.5">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.08em] text-[var(--steel)]">Scanner health</p>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-xs font-semibold text-[var(--steel)]">Terminal sync</span>
              <span className="rounded-[var(--radius-sm)] border border-[var(--line-strong)] bg-[var(--signal-soft)] px-1.5 py-0.5 text-[0.6875rem] font-bold text-[var(--signal-strong)]">Online</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area — flex-1 avoids 100vh trap, dvh-safe, safe-area bottom for bottom nav */}
      <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden bg-white pb-[calc(5rem+env(safe-area-inset-bottom))] lg:h-dvh lg:min-h-0 lg:pb-0">
        <div className="ops-main">{children}</div>
      </div>

      {/* Mobile Fixed Bottom Navigation */}
      <MobileBottomNav role={role} />
    </div>
  );
}
