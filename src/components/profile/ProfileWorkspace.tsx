"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { BriefcaseBusiness, FileCheck2, LockKeyhole, Mail, Phone, Settings, ShoppingCart, Ticket, UserRound } from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { apiGet, apiPatch, normalizeApiError } from "@/lib/api/client";
import type { TrackerUser, UserRole } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";
import { money, readTuckShopPurchaseHistory, type TuckShopPurchaseHistoryItem } from "@/lib/tuck-shop/cart";

type ProfileShortcut = {
  label: string;
  href: string;
  detail: string;
  icon: LucideIcon;
};

type ProfileForm = {
  emailAddress: string;
  cellphoneNumber: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const userShortcuts: ProfileShortcut[] = [
  { label: "Jobs", href: "/dashboard/user/jobs", detail: "Browse roles from businesses you follow.", icon: BriefcaseBusiness },
  { label: "Applications", href: "/dashboard/user/applications", detail: "Track submitted job applications.", icon: FileCheck2 },
  { label: "My Carts", href: "/dashboard/user/carts", detail: "Open the active cart and checkout.", icon: ShoppingCart },
  { label: "My Tickets", href: "/dashboard/user/tickets", detail: "View purchased ticket QR codes.", icon: Ticket },
];

function roles(user?: TrackerUser | null) {
  const raw = user?.roles?.length ? user.roles : user?.privilege ? [user.privilege] : [];
  return raw.map(String).filter(Boolean);
}

function userPhone(user?: TrackerUser | null) {
  const source = (user ?? {}) as Record<string, unknown>;
  return String(source.cellphoneNumber ?? source.cellphone ?? source.phoneNumber ?? source.mobileNumber ?? "");
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Not set";
  return String(value);
}

export function ProfileWorkspace({ role }: { role: UserRole }) {
  const [user, setUser] = useState<TrackerUser | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<TuckShopPurchaseHistoryItem[]>([]);
  const [profileForm, setProfileForm] = useState<ProfileForm>({ emailAddress: "", cellphoneNumber: "" });
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError(null);

      try {
        const nextUser = await apiGet<TrackerUser>("/users/me");
        if (!mounted) return;
        setUser(nextUser);
        setProfileForm({ emailAddress: nextUser.emailAddress ?? "", cellphoneNumber: userPhone(nextUser) });
      } catch (exception) {
        if (mounted) setError(normalizeApiError(exception).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    setPurchaseHistory(readTuckShopPurchaseHistory());
    void loadProfile();

    function refreshPurchaseHistory() {
      setPurchaseHistory(readTuckShopPurchaseHistory());
    }

    window.addEventListener("storage", refreshPurchaseHistory);
    window.addEventListener("king-sparkon:tuck-shop-purchase-history", refreshPurchaseHistory);

    return () => {
      mounted = false;
      window.removeEventListener("storage", refreshPurchaseHistory);
      window.removeEventListener("king-sparkon:tuck-shop-purchase-history", refreshPurchaseHistory);
    };
  }, []);

  const accountRoles = roles(user);
  const totalPurchased = useMemo(() => purchaseHistory.reduce((total, item) => total + item.productTotal, 0), [purchaseHistory]);
  const purchasedBusinesses = useMemo(() => new Set(purchaseHistory.map((item) => item.businessName ?? item.businessId ?? "Unknown business")).size, [purchaseHistory]);

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setError(null);
    setNotice(null);

    try {
      const updatedUser = await apiPatch<TrackerUser, ProfileForm>("/users/me", profileForm);
      setUser(updatedUser);
      setProfileForm({ emailAddress: updatedUser.emailAddress ?? profileForm.emailAddress, cellphoneNumber: userPhone(updatedUser) || profileForm.cellphoneNumber });
      setNotice("Profile contact details updated.");
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingPassword(true);
    setError(null);
    setNotice(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New password and confirm password must match.");
      setSavingPassword(false);
      return;
    }

    try {
      await apiPatch<unknown, PasswordForm>("/users/me/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("Password update request submitted.");
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <DashboardHeader role={`${role.toUpperCase()} PROFILE`} title="Profile settings" description="View account details, update email address, cellphone number and password, then jump back to jobs, applications, carts and tickets." />
      <main className="grid gap-6 p-5 md:p-8">
        {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        {notice ? <p className="rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--ink)]">{notice}</p> : null}

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="overflow-hidden bg-white">
            <div className="bg-[var(--ink)] p-6 text-white enterprise-grid">
              <div className="grid h-16 w-16 place-items-center rounded-[1.35rem] border border-white/15 bg-white/10 text-[var(--gold)]">
                <UserRound className="h-7 w-7" />
              </div>
              <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">User details</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">{loading ? "Loading profile" : displayValue(user?.username)}</h1>
              <p className="mt-2 break-all text-sm font-semibold text-white/70">{displayValue(user?.emailAddress)}</p>
            </div>
            <CardContent className="grid gap-3">
              {[
                ["Username", user?.username],
                ["Email address", user?.emailAddress],
                ["Cellphone number", userPhone(user)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
                  <p className="mt-2 break-all text-sm font-bold text-[var(--ink)]">{loading ? "Loading..." : displayValue(value)}</p>
                </div>
              ))}
              <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Roles</p>
                <div className="mt-3 flex flex-wrap gap-2">{(accountRoles.length ? accountRoles : [role]).map((item) => <StatusPill key={item} label={item} tone="confirm" />)}</div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard label="Profile status" value={loading ? "..." : user ? "Loaded" : "Unavailable"} detail="Protected session profile" tone={user ? "confirm" : "neutral"} icon={<UserRound className="h-5 w-5" />} />
              <MetricCard label="Purchased carts" value={String(purchaseHistory.length)} detail={`${purchasedBusinesses} business${purchasedBusinesses === 1 ? "" : "es"}`} tone="signal" icon={<ShoppingCart className="h-5 w-5" />} />
              <MetricCard label="Total spent" value={money(totalPurchased)} detail="Saved product cart history" icon={<Ticket className="h-5 w-5" />} />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick profile actions</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {userShortcuts.map(({ label, href, detail, icon: Icon }) => (
                  <Link key={href} href={href} className="group rounded-[1.35rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ink)] text-[var(--gold)]"><Icon className="h-4 w-4" /></div>
                    <p className="mt-4 font-black text-[var(--ink)]">{label}</p>
                    <p className="mt-2 text-xs leading-5 text-[var(--steel)]">{detail}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Update email address and cellphone</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="grid gap-4">
                <label className="grid gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Mail className="h-4 w-4 text-[var(--signal)]" /> Email address</span>
                  <input value={profileForm.emailAddress} onChange={(event) => setProfileForm((current) => ({ ...current, emailAddress: event.target.value }))} type="email" className="min-h-12 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" placeholder="user@example.com" />
                </label>
                <label className="grid gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Phone className="h-4 w-4 text-[var(--signal)]" /> Cellphone number</span>
                  <input value={profileForm.cellphoneNumber} onChange={(event) => setProfileForm((current) => ({ ...current, cellphoneNumber: event.target.value }))} type="tel" className="min-h-12 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" placeholder="+27 00 000 0000" />
                </label>
                <Button type="submit" disabled={savingProfile}><Settings className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save contact details"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Update password</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="grid gap-4">
                <label className="grid gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><LockKeyhole className="h-4 w-4 text-[var(--signal)]" /> Current password</span>
                  <input value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} type="password" className="min-h-12 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" />
                </label>
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="grid gap-2">
                    <span className="text-sm font-black text-[var(--ink)]">New password</span>
                    <input value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} type="password" className="min-h-12 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-black text-[var(--ink)]">Confirm password</span>
                    <input value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} type="password" className="min-h-12 rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]" />
                  </label>
                </div>
                <Button type="submit" disabled={savingPassword}><LockKeyhole className="h-4 w-4" /> {savingPassword ? "Updating..." : "Update password"}</Button>
              </form>
            </CardContent>
          </Card>
        </section>

        <Card>
          <CardHeader>
            <CardTitle>My carts and purchases</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Product checkout history saved on this device, showing what was purchased and from which business.</p>
          </CardHeader>
          <CardContent className="grid gap-4">
            {purchaseHistory.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-[var(--line)] bg-white p-8 text-center">
                <ShoppingCart className="mx-auto h-10 w-10 text-[var(--signal)]" />
                <p className="mt-3 text-xl font-black text-[var(--ink)]">No purchased carts yet</p>
                <p className="mt-2 text-sm leading-6 text-[var(--steel)]">After checkout, purchased product carts will appear here with business and product details.</p>
                <Link href="/dashboard/user/shop" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">Buy products</Link>
              </div>
            ) : (
              purchaseHistory.map((purchase) => (
                <article key={purchase.id} className="rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">{purchase.businessName ?? `Business #${purchase.businessId ?? "-"}`}</p>
                      <h3 className="mt-1 text-xl font-black text-[var(--ink)]">Cart #{purchase.transactionId ?? purchase.id}</h3>
                      <p className="mt-1 text-xs font-bold text-[var(--steel)]">{new Date(purchase.createdAt).toLocaleString()} · {purchase.paymentStatus ?? "PENDING"}</p>
                    </div>
                    <p className="money text-2xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {purchase.items.map((item) => (
                      <div key={`${purchase.id}-${item.productId}`} className="flex flex-col gap-2 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-black text-[var(--ink)]">{item.productName}</p>
                          <p className="text-xs font-bold text-[var(--steel)]">Qty {item.quantity} · {money(item.unitPrice)} each</p>
                        </div>
                        <p className="money font-black text-[var(--ink)]">{money(item.lineTotal)}</p>
                      </div>
                    ))}
                  </div>
                </article>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
