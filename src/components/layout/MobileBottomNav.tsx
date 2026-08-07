"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronRight, MoreHorizontal, Power, UserRound, X } from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { getRoleNavConfig, isActive, type NavItem } from "@/components/layout/DashboardRoleNav";
import { userProfileShortcuts } from "@/components/layout/DashboardHeaderActions";
import type { UserRole } from "@/lib/types/backend";
import { cn } from "@/lib/utils/cn";

function normalizedRole(roleStr: string): UserRole {
  const value = roleStr.toLowerCase();
  if (value.includes("admin")) return "Admin";
  if (value.includes("owner")) return "Owner";
  if (value.includes("worker")) return "Worker";
  if (value.includes("affiliate")) return "Affiliate";
  return "User";
}

export function MobileBottomNav({ role: rawRole }: { role: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [moreOpen, setMoreOpen] = useState(false);

  const role = useMemo(() => normalizedRole(rawRole), [rawRole]);
  const { primary, secondary } = useMemo(() => getRoleNavConfig(role), [role]);

  // For User role, add secondary user shortcuts if secondary is empty
  const allSecondaryItems: NavItem[] = useMemo(() => {
    if (secondary.length > 0) return secondary;
    if (role === "User") {
      return userProfileShortcuts.map((s) => ({
        label: s.label,
        href: s.href,
        icon: s.icon,
        shortLabel: s.label,
        description: `View ${s.label.toLowerCase()}`,
      }));
    }
    return [];
  }, [secondary, role]);

  const profileHref = `/dashboard/${role.toLowerCase()}/profile`;

  const isMoreActive = useMemo(() => {
    return allSecondaryItems.some((item) => isActive(pathname, searchParams, item.href));
  }, [allSecondaryItems, pathname, searchParams]);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!moreOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMoreOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [moreOpen]);

  const hasMore = allSecondaryItems.length > 0;

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--line)] bg-white/95 backdrop-blur-md shadow-[0_-4px_25px_rgba(0,0,0,0.08)] pb-[env(safe-area-inset-bottom)] lg:hidden"
        aria-label="Mobile Bottom Navigation"
      >
        <div className="grid h-16 max-w-lg mx-auto grid-cols-5 items-center px-1">
          {primary.map(({ label, shortLabel, href, icon: Icon }) => {
            const active = isActive(pathname, searchParams, href);
            const displayText = shortLabel || label;
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group flex flex-col items-center justify-center h-full w-full py-1 text-center transition-colors relative min-h-[44px]",
                  active ? "text-[var(--signal-strong)] font-black" : "text-[var(--steel)] hover:text-[var(--ink)] font-bold",
                )}
              >
                {active ? (
                  <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--signal-strong)]" />
                ) : null}
                <span className={cn(
                  "grid h-7 w-7 place-items-center rounded-lg transition-transform group-active:scale-95",
                  active ? "bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "text-[var(--steel)] group-hover:text-[var(--ink)]",
                )}>
                  <Icon className="h-4.5 w-4.5" />
                </span>
                <span className="mt-0.5 truncate text-[0.62rem] tracking-tight">{displayText}</span>
              </Link>
            );
          })}

          {hasMore ? (
            <button
              type="button"
              onClick={() => setMoreOpen((curr) => !curr)}
              aria-label={moreOpen ? "Close more navigation menu" : "Open more navigation menu"}
              aria-expanded={moreOpen}
              className={cn(
                "group flex flex-col items-center justify-center h-full w-full py-1 text-center transition-colors relative min-h-[44px]",
                isMoreActive || moreOpen ? "text-[var(--signal-strong)] font-black" : "text-[var(--steel)] hover:text-[var(--ink)] font-bold",
              )}
            >
              {(isMoreActive || moreOpen) ? (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--signal-strong)]" />
              ) : null}
              <span className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-transform group-active:scale-95",
                isMoreActive || moreOpen ? "bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "text-[var(--steel)] group-hover:text-[var(--ink)]",
              )}>
                <MoreHorizontal className="h-5 w-5" />
              </span>
              <span className="mt-0.5 truncate text-[0.62rem] tracking-tight">More</span>
            </button>
          ) : (
            <Link
              href={profileHref}
              aria-current={pathname === profileHref ? "page" : undefined}
              className={cn(
                "group flex flex-col items-center justify-center h-full w-full py-1 text-center transition-colors relative min-h-[44px]",
                pathname === profileHref ? "text-[var(--signal-strong)] font-black" : "text-[var(--steel)] hover:text-[var(--ink)] font-bold",
              )}
            >
              {pathname === profileHref ? (
                <span className="absolute top-0 h-0.5 w-8 rounded-full bg-[var(--signal-strong)]" />
              ) : null}
              <span className={cn(
                "grid h-7 w-7 place-items-center rounded-lg transition-transform group-active:scale-95",
                pathname === profileHref ? "bg-[var(--signal-soft)] text-[var(--signal-strong)]" : "text-[var(--steel)] group-hover:text-[var(--ink)]",
              )}>
                <UserRound className="h-4.5 w-4.5" />
              </span>
              <span className="mt-0.5 truncate text-[0.62rem] tracking-tight">Profile</span>
            </Link>
          )}
        </div>
      </nav>

      {/* Slide-Up "More" Sheet Overlay */}
      {moreOpen && hasMore ? (
        <>
          <button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs transition-opacity lg:hidden"
            onClick={() => setMoreOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[85vh] flex-col rounded-t-2xl border-t border-[var(--line)] bg-white p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.18)] pb-[calc(1.5rem+env(safe-area-inset-bottom))] lg:hidden animate-in slide-in-from-bottom duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="More navigation destinations"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md border border-[var(--line)] bg-[var(--signal-soft)] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-[var(--signal-strong)]">
                  {role} Menu
                </span>
                <span className="text-xs font-bold text-[var(--steel)]">Secondary destinations</span>
              </div>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] text-[var(--steel)] hover:bg-[var(--surface)] hover:text-[var(--ink)]"
                aria-label="Close menu"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <div className="grid flex-1 content-start gap-1.5 overflow-y-auto py-3 overscroll-contain">
              {allSecondaryItems.map(({ label, href, icon: Icon, description }) => {
                const active = isActive(pathname, searchParams, href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMoreOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group flex min-h-[3.25rem] w-full items-center justify-between rounded-xl border px-3.5 py-2.5 transition-colors",
                      active
                        ? "border-[var(--signal)] bg-[var(--signal-soft)] text-[var(--signal-strong)] font-black"
                        : "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface)]",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={cn(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-lg border transition-colors",
                        active ? "border-[var(--line-strong)] bg-white text-[var(--signal-strong)]" : "border-[var(--line)] bg-white text-[var(--signal)]",
                      )}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold">{label}</p>
                        {description ? (
                          <p className={cn("truncate text-[0.68rem] font-medium", active ? "text-[var(--signal-strong)]/70" : "text-[var(--steel)]")}>
                            {description}
                          </p>
                        ) : null}
                      </div>
                    </div>
                    <ChevronRight className={cn("h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5", active ? "text-[var(--signal-strong)]" : "text-[var(--steel)]")} />
                  </Link>
                );
              })}
            </div>

            <div className="mt-2 grid shrink-0 gap-2 border-t border-[var(--line)] pt-3">
              <Link
                href={profileHref}
                onClick={() => setMoreOpen(false)}
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--line)] bg-white text-xs font-black text-[var(--ink)] hover:bg-[var(--surface)]"
              >
                <UserRound className="h-4 w-4 text-[var(--signal)]" /> Update Account Profile
              </Link>
              <LogoutButton
                className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/5 text-xs font-black text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white"
                ariaLabel="Sign out"
              >
                <Power className="h-4 w-4" /> Sign Out
              </LogoutButton>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
}
