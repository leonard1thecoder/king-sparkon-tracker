"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  ChevronDown,
  FileCheck2,
  Landmark,
  Loader2,
  Mail,
  Power,
  ShieldCheck,
  ShoppingCart,
  Ticket,
  UserRound,
} from "lucide-react";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { apiGet } from "@/lib/api/client";
import { getOwnerWallet } from "@/lib/api/owner-finance";
import type { TrackerUser } from "@/lib/types/backend";

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
  profilePictureUrl?: string | null;
};

type HeaderProfile = TrackerUser & SessionProfile & {
  profilePictureUrl?: string | null;
};

const userProfileShortcuts: ProfileShortcut[] = [
  { label: "Jobs", href: "/dashboard/user/jobs", icon: BriefcaseBusiness },
  { label: "My Tickets", href: "/dashboard/user/tickets", icon: Ticket },
  { label: "Applications", href: "/dashboard/user/applications", icon: FileCheck2 },
  { label: "My Carts", href: "/dashboard/user/carts", icon: ShoppingCart },
];

const iconButtonClass = "inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--line)] bg-white text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-[var(--surface)]";

function money(value: number) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function normalizedRole(role: string) {
  const value = role.toLowerCase();
  if (value.includes("admin")) return "admin";
  if (value.includes("owner")) return "owner";
  if (value.includes("worker")) return "worker";
  if (value.includes("affiliate")) return "affiliate";
  return "user";
}

function ownerRole(role: string) {
  return normalizedRole(role) === "owner";
}

function userRole(role: string) {
  return normalizedRole(role) === "user";
}

function profileRoute(role: string) {
  return `/dashboard/${normalizedRole(role)}/profile`;
}

function roleDescription(role: string) {
  switch (normalizedRole(role)) {
    case "admin":
      return "Update the administrator account, contact details, profile image and password.";
    case "owner":
      return "Update the business owner account, contact details, address, profile image and password.";
    case "worker":
      return "Update the worker account, contact details, address, profile image and password.";
    case "affiliate":
      return "Update the affiliate account, contact details, profile image and password.";
    default:
      return "Update your account, contact details, profile image and password.";
  }
}

function OwnerBalanceAction() {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadBalance() {
      try {
        const wallet = await getOwnerWallet();
        if (active) setTotal(Number(wallet.availableBalance ?? 0));
      } catch {
        if (active) setTotal(0);
      } finally {
        if (active) setLoading(false);
      }
    }

    function refresh() {
      setLoading(true);
      void loadBalance();
    }

    void loadBalance();
    const timer = window.setInterval(loadBalance, 30_000);
    window.addEventListener("focus", refresh);
    window.addEventListener("king-sparkon:owner-wallet", refresh);

    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("king-sparkon:owner-wallet", refresh);
    };
  }, []);

  return (
    <Link
      href="/dashboard/owner/withdrawals"
      className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-[var(--gold)] bg-[var(--ink)] px-4 text-xs font-black uppercase tracking-[0.1em] text-[var(--gold)] shadow-[var(--shadow-soft)] hover:bg-white"
      aria-label="Open business balance and withdrawals"
      title={`King Sparkon balance · ${loading ? "Loading" : money(total)}`}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Landmark className="h-4 w-4" />}
      <span className="sr-only">Business balance and withdrawals</span>
      <span className="money hidden text-white/90 lg:inline">{loading ? "..." : money(total)}</span>
    </Link>
  );
}

function ProfileDropdown({ role }: { role: string }) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<HeaderProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoadingProfile(true);
      try {
        const user = await apiGet<HeaderProfile>("/users/me");
        if (active) setProfile(user);
      } catch {
        try {
          const response = await fetch("/api/auth/session", { cache: "no-store" });
          if (!response.ok) throw new Error("Session profile unavailable");
          const session = (await response.json()) as HeaderProfile;
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

  const source = profile ?? ({} as HeaderProfile);
  const displayName = source.username || source.name || "King Sparkon user";
  const emailAddress = source.emailAddress || source.email || "Email address not available";
  const accountRole = String(source.roles?.[0] ?? source.privilege ?? source.role ?? normalizedRole(role));
  const verified = source.emailVerified !== false;
  const shortcuts = userRole(role) ? userProfileShortcuts : [];
  const href = profileRoute(role);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${iconButtonClass} relative overflow-hidden`}
        aria-label="Open profile menu"
        aria-expanded={open}
        aria-controls="dashboard-profile-menu"
        aria-haspopup="menu"
        title="Profile"
      >
        {source.profilePictureUrl ? (
          <img src={source.profilePictureUrl} alt="" className="h-full w-full object-cover" />
        ) : loadingProfile ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UserRound className="h-4.5 w-4.5" />
        )}
        <span className="absolute bottom-0 right-0 grid h-4 w-4 place-items-center rounded-full border border-white bg-[var(--ink)] text-white">
          <ChevronDown className="h-2.5 w-2.5" />
        </span>
      </button>

      {open ? (
        <div id="dashboard-profile-menu" className="absolute right-0 z-50 mt-2 grid w-[min(22rem,calc(100vw-2rem))] gap-1 rounded-[1.35rem] border border-[var(--line)] bg-white p-2 shadow-[var(--shadow-ledger)]" role="menu">
          <section className="mb-1 overflow-hidden rounded-[1.15rem] border border-[var(--ink)]/15 bg-[var(--gold)]/18 shadow-[var(--shadow-soft)]" aria-label="Signed-in user information">
            <div className="border-b border-[var(--ink)]/15 bg-[var(--gold)] p-4 text-[var(--ink)]">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-[1rem] border border-[var(--ink)]/15 bg-white/75 text-[var(--ink)] shadow-[var(--shadow-soft)]">
                  {source.profilePictureUrl ? <img src={source.profilePictureUrl} alt="" className="h-full w-full object-cover" /> : loadingProfile ? <Loader2 className="h-5 w-5 animate-spin" /> : <UserRound className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">Signed in as</p>
                  <p className="mt-1 break-words text-lg font-black leading-tight tracking-[-0.025em] text-[var(--ink)]">{loadingProfile ? "Loading your profile" : displayName}</p>
                  <p className="mt-2 flex min-w-0 items-start gap-1.5 text-xs font-bold leading-5 text-[var(--ink)]/65">
                    <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    <span className="break-all">{loadingProfile ? "Checking account details" : emailAddress}</span>
                  </p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 bg-white/72 p-3">
              <p className="text-xs font-semibold leading-5 text-[var(--steel)]">{roleDescription(role)}</p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[var(--ink)]/15 bg-[var(--gold)] px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[var(--ink)]">{accountRole}</span>
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.62rem] font-black uppercase tracking-[0.1em] ${verified ? "bg-[var(--confirm)]/12 text-[var(--confirm)]" : "bg-[var(--signal)]/12 text-[var(--signal)]"}`}>
                  <ShieldCheck className="h-3 w-3" /> {verified ? "Verified account" : "Verify email"}
                </span>
              </div>
            </div>
          </section>

          {shortcuts.map(({ label, href: shortcutHref, icon: Icon }) => (
            <Link key={shortcutHref} href={shortcutHref} onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center gap-3 rounded-[1rem] px-3 text-sm font-black text-[var(--ink)] transition hover:bg-[var(--surface)]" role="menuitem">
              <Icon className="h-4 w-4 text-[var(--signal)]" /> {label}
            </Link>
          ))}

          <Link href={href} onClick={() => setOpen(false)} className="inline-flex min-h-11 items-center gap-3 rounded-[1rem] border-t border-[var(--line)] px-3 pt-2 text-sm font-black text-[var(--ink)] transition hover:bg-[var(--surface)]" role="menuitem">
            <UserRound className="h-4 w-4 text-[var(--signal)]" /> Update profile
          </Link>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardHeaderActions({ role }: { role: string }) {
  const showCheckout = useMemo(() => userRole(role), [role]);
  const showBalance = useMemo(() => ownerRole(role), [role]);

  return (
    <div className="flex items-center justify-end gap-2">
      {showBalance ? <OwnerBalanceAction /> : null}
      {showCheckout ? (
        <>
          <Link href="/dashboard/user/shop" className={iconButtonClass} aria-label="Buy products" title="Buy products">
            <ShoppingCart className="h-4 w-4" />
          </Link>
          <Link href="/dashboard/user/tickets/buy" className={iconButtonClass} aria-label="Buy tickets" title="Buy tickets">
            <Ticket className="h-4 w-4" />
          </Link>
        </>
      ) : null}
      <ProfileDropdown role={role} />
      <LogoutButton className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[var(--danger)] bg-white text-[var(--danger)] shadow-[var(--shadow-soft)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-60" ariaLabel="Sign out">
        <Power className="h-4 w-4" />
      </LogoutButton>
    </div>
  );
}
