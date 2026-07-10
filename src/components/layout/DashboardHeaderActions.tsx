"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileCheck2,
  Loader2,
  Mail,
  Power,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  UserRound,
  WalletCards,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { apiGet, normalizeApiError } from "@/lib/api/client";
import type { TrackerUser } from "@/lib/types/backend";

type TipRow = Record<string, unknown>;
type TipPayload = TipRow[] | {
  content?: TipRow[];
  data?: TipRow[];
  items?: TipRow[];
  withdrawableAmount?: number;
  accountTotal?: number;
  totalWithdrawable?: number;
  availableToWithdraw?: number;
};

type ProfileShortcut = {
  label: string;
  href: string;
  icon: typeof UserRound;
};

type SessionProfile = {
  username?: string;
  name?: string;
  emailAddress?: string;
  email?: string;
  privilege?: string;
  role?: string;
  emailVerified?: boolean;
};

const userProfileShortcuts: ProfileShortcut[] = [
  { label: "Jobs", href: "/dashboard/user/jobs", icon: BriefcaseBusiness },
  { label: "My Tickets", href: "/dashboard/user/tickets", icon: Ticket },
  { label: "Applications", href: "/dashboard/user/applications", icon: FileCheck2 },
  { label: "My Carts", href: "/dashboard/user/carts", icon: ShoppingCart },
];

const iconButtonClass = "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-[var(--shadow-soft)] hover:border-[var(--gold)] hover:bg-[var(--surface)]";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
}

function numeric(value: unknown) {
  const next = Number(value ?? 0);
  return Number.isFinite(next) ? next : 0;
}

function rowsFromPayload(payload: TipPayload): TipRow[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.content)) return payload.content;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.items)) return payload.items;
  return [];
}

function explicitTotal(payload: TipPayload) {
  if (Array.isArray(payload)) return undefined;
  const total = payload.withdrawableAmount ?? payload.availableToWithdraw ?? payload.totalWithdrawable ?? payload.accountTotal;
  return typeof total === "number" && Number.isFinite(total) ? total : undefined;
}

function isWithdrawable(row: TipRow) {
  const status = String(row.status ?? row.paymentStatus ?? row.state ?? "").toLowerCase();
  const paidFlag = row.paid === true || row.paidToWorker === true || row.withdrawn === true;
  if (paidFlag) return false;
  if (status.includes("paid") || status.includes("withdrawn") || status.includes("failed") || status.includes("cancel")) return false;
  return true;
}

function rowAmount(row: TipRow) {
  return numeric(row.netAmount ?? row.amountToWithdraw ?? row.tipAmount ?? row.grossAmount ?? row.amount);
}

function calculateWithdrawable(payload: TipPayload) {
  const total = explicitTotal(payload);
  if (total !== undefined) return total;
  return rowsFromPayload(payload).filter(isWithdrawable).reduce((sum, row) => sum + rowAmount(row), 0);
}

function ownerRole(role: string) {
  return role.toLowerCase().includes("owner");
}

function userRole(role: string) {
  return role.toLowerCase().includes("user");
}

function OwnerWithdrawAction() {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadWithdrawableTotal() {
      try {
        const payload = await apiGet<TipPayload>("/tips");
        if (active) setTotal(calculateWithdrawable(payload));
      } catch (error) {
        normalizeApiError(error);
        if (active) setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadWithdrawableTotal();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Link href="/dashboard/owner/tips#withdraw" className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--ink)] px-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--gold)] shadow-[var(--shadow-soft)] hover:bg-white" aria-label="Withdraw tips" title={`Withdraw tips · ${loading ? "Loading" : money(total)}`}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <WalletCards className="h-4 w-4" />}
      <span className="sr-only">Withdraw tips</span>
      <span className="money hidden text-white/90 lg:inline">{loading ? "..." : money(total)}</span>
    </Link>
  );
}

function UserProfileDropdown() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<TrackerUser | SessionProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoadingProfile(true);

      try {
        const user = await apiGet<TrackerUser>("/users/me");
        if (active) setProfile(user);
      } catch {
        try {
          const response = await fetch("/api/auth/session", { cache: "no-store" });
          if (!response.ok) throw new Error("Session profile unavailable");
          const session = (await response.json()) as SessionProfile;
          if (active) setProfile(session);
        } catch {
          if (active) setProfile(null);
        }
      } finally {
        if (active) setLoadingProfile(false);
      }
    }

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const source = (profile ?? {}) as TrackerUser & SessionProfile;
  const displayName = source.username || source.name || "King Sparkon user";
  const emailAddress = source.emailAddress || source.email || "Email address not available";
  const accountRole = String(source.roles?.[0] ?? source.privilege ?? source.role ?? "User");
  const verified = source.emailVerified !== false;

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((current) => !current)} className={iconButtonClass} aria-label="Open profile menu" aria-expanded={open} aria-controls="user-profile-menu" aria-haspopup="menu" title="Profile menu">
        <UserRound className="h-4 w-4" />
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open ? (
        <div id="user-profile-menu" className="absolute right-0 z-50 mt-2 grid w-[min(22rem,calc(100vw-2rem))] gap-1 rounded-[1.35rem] border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-ledger)]" role="menu">
          <section className="mb-1 overflow-hidden rounded-[1.15rem] border border-[var(--ink)]/15 bg-[var(--gold)]/18 shadow-[var(--shadow-soft)]" aria-label="Signed-in user information">
            <div className="border-b border-[var(--ink)]/15 bg-[var(--gold)] p-4 text-[var(--ink)]">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1rem] border border-[var(--ink)]/15 bg-white/75 text-[var(--ink)] shadow-[var(--shadow-soft)]">
                  {loadingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserRound className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Signed in as</p>
                  <p className="mt-1 break-words text-lg font-black leading-tight tracking-[-0.025em] text-[var(--ink)]">
                    {loadingProfile ? "Loading your profile" : displayName}
                  </p>
                  <p className="mt-2 flex min-w-0 items-start gap-1.5 text-xs font-bold leading-5 text-[var(--ink)]/65">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="break-all">{loadingProfile ? "Checking account details" : emailAddress}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 bg-white/72 p-3">
              <p className="text-xs font-semibold leading-5 text-[var(--steel)]">
                Your personal workspace for shopping, tickets, worker tips, job opportunities, and application tracking.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--ink)]/15 bg-[var(--gold)] px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--ink)]">{accountRole}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] ${verified ? "bg-[var(--confirm)]/12 text-[var(--confirm)]" : "bg-[var(--signal)]/12 text-[var(--signal)]"}`}>
                  <ShieldCheck className="h-3 w-3" /> {verified ? "Verified account" : "Verify email"}
                </span>
              </div>
            </div>
          </section>

          {userProfileShortcuts.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center gap-3 rounded-[1rem] px-3 text-sm font-black text-[var(--ink)] transition hover:bg-[var(--surface)]" role="menuitem">
              <Icon className="h-4 w-4 text-[var(--signal)]" /> {label}
            </Link>
          ))}
          <Link href="/dashboard/user/profile" onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center gap-3 rounded-[1rem] border-t border-[var(--line)] px-3 pt-2 text-sm font-black text-[var(--ink)] transition hover:bg-[var(--surface)]" role="menuitem">
            <UserRound className="h-4 w-4 text-[var(--signal)]" /> Profile settings
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardHeaderActions({ role }: { role: string }) {
  const showCheckout = useMemo(() => userRole(role), [role]);
  const showWithdraw = useMemo(() => ownerRole(role), [role]);

  return (
    <div className="flex items-center justify-end gap-2">
      {showWithdraw ? <OwnerWithdrawAction /> : null}
      {showCheckout ? (
        <>
          <Link href="/dashboard/user/shop" className={iconButtonClass} aria-label="Buy products" title="Buy products">
            <ShoppingCart className="h-4 w-4" />
          </Link>
          <Link href="/dashboard/user/tickets/buy" className={iconButtonClass} aria-label="Buy tickets" title="Buy tickets">
            <Ticket className="h-4 w-4" />
          </Link>
          <UserProfileDropdown />
        </>
      ) : null}
      <LogoutButton className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--danger)] bg-white text-[var(--danger)] shadow-[var(--shadow-soft)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-60" ariaLabel="Sign out">
        <Power className="h-4 w-4" />
      </LogoutButton>
    </div>
  );
}
