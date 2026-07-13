"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Boxes,
  CreditCard,
  Image,
  LockKeyhole,
  Mail,
  MapPin,
  PackageSearch,
  Phone,
  ScanLine,
  Settings,
  ShoppingCart,
  Ticket,
  UserRound,
  WalletCards,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { apiGet, apiPatch, normalizeApiError } from "@/lib/api/client";
import type { TrackerUser, UserRole } from "@/lib/types/backend";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { Button } from "@/components/ui/Button";

type EditableProfile = TrackerUser & {
  physicalAddress?: string | null;
  cellphoneNumber?: string | null;
  profilePictureUrl?: string | null;
  jobTitle?: string | null;
  tipQrCodeEnabled?: boolean;
  onboardingCompleted?: boolean;
};

type ProfileShortcut = {
  label: string;
  href: string;
  detail: string;
  icon: LucideIcon;
};

type ProfileForm = {
  emailAddress: string;
  physicalAddress: string;
  cellphoneNumber: string;
  profilePictureUrl: string;
};

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

const userShortcuts: ProfileShortcut[] = [
  { label: "My Carts", href: "/dashboard/user/carts", detail: "Review product purchases and collections.", icon: ShoppingCart },
  { label: "My Tickets", href: "/dashboard/user/tickets", detail: "View and verify purchased tickets.", icon: Ticket },
];

const workerShortcuts: ProfileShortcut[] = [
  { label: "Products & Barcodes", href: "/dashboard/worker/products", detail: "Manage workplace product stock codes.", icon: Boxes },
  { label: "Counter Checkout", href: "/dashboard/worker/scan", detail: "Complete cash or card product sales.", icon: ScanLine },
  { label: "Online Orders", href: "/dashboard/worker/orders", detail: "Prepare paid carts for collection.", icon: PackageSearch },
  { label: "Product Sales", href: "/dashboard/worker/transactions", detail: "Review completed product carts.", icon: CreditCard },
  { label: "Tips & QR", href: "/dashboard/worker/tips", detail: "Open the owner-controlled tips workspace.", icon: WalletCards },
];

function roles(user?: TrackerUser | null) {
  const raw = user?.roles?.length ? user.roles : user?.privilege ? [user.privilege] : [];
  return raw.map(String).filter(Boolean);
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Not set";
  return String(value);
}

const inputClass = "min-h-12 min-w-0 w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]";

export function ProfileWorkspace({ role }: { role: UserRole }) {
  const [user, setUser] = useState<EditableProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({ emailAddress: "", physicalAddress: "", cellphoneNumber: "", profilePictureUrl: "" });
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
        const nextUser = await apiGet<EditableProfile>("/users/me");
        if (!mounted) return;
        setUser(nextUser);
        setProfileForm({
          emailAddress: nextUser.emailAddress ?? "",
          physicalAddress: nextUser.physicalAddress ?? "",
          cellphoneNumber: nextUser.cellphoneNumber ?? "",
          profilePictureUrl: nextUser.profilePictureUrl ?? "",
        });
      } catch (exception) {
        if (mounted) setError(normalizeApiError(exception).message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    void loadProfile();
    return () => {
      mounted = false;
    };
  }, []);

  const accountRoles = roles(user);
  const primaryRole = accountRoles[0] ?? role;
  const emailVerified = user?.emailVerified !== false;
  const workerRole = role === "Worker";
  const shortcuts = workerRole ? workerShortcuts : role === "User" ? userShortcuts : [];

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setError(null);
    setNotice(null);

    try {
      const updatedUser = await apiPatch<EditableProfile, ProfileForm>("/users/me", profileForm);
      setUser(updatedUser);
      setProfileForm({
        emailAddress: updatedUser.emailAddress ?? profileForm.emailAddress,
        physicalAddress: updatedUser.physicalAddress ?? profileForm.physicalAddress,
        cellphoneNumber: updatedUser.cellphoneNumber ?? profileForm.cellphoneNumber,
        profilePictureUrl: updatedUser.profilePictureUrl ?? profileForm.profilePictureUrl,
      });
      setNotice(updatedUser.emailVerified === false ? "Profile updated. Verify the changed email address before protected email flows." : "Profile details updated.");
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
      await apiPatch<void, PasswordForm>("/users/me/password", passwordForm);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setNotice("Password updated successfully.");
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <>
      <DashboardHeader
        role={`${role.toUpperCase()} PROFILE`}
        title="Profile settings"
        description={workerRole ? "Update your worker account details, address, profile picture and password. Tips access is controlled by the business owner." : "View and update your account contact, address, profile picture and password."}
      />

      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        {notice ? <p className="rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--ink)]">{notice}</p> : null}

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="overflow-hidden bg-white">
            <div className="bg-[var(--ink)] p-6 text-white enterprise-grid">
              <div className="grid h-20 w-20 place-items-center overflow-hidden rounded-[1.35rem] border border-white/15 bg-white/10 text-[var(--gold)]">
                {user?.profilePictureUrl ? <img src={user.profilePictureUrl} alt={user.username} className="h-full w-full object-cover" /> : <UserRound className="h-8 w-8" />}
              </div>
              <p className="mt-5 font-mono text-xs font-black uppercase tracking-[0.18em] text-[var(--gold)]">Account details</p>
              <h1 className="mt-2 text-3xl font-black tracking-[-0.05em]">{loading ? "Loading profile" : displayValue(user?.username)}</h1>
              <p className="mt-2 break-all text-sm font-semibold text-white/70">{loading ? "Checking account details" : displayValue(user?.emailAddress)}</p>
            </div>

            <CardContent className="grid gap-3">
              {[
                ["Username", user?.username],
                ["Email address", user?.emailAddress],
                ["Cellphone number", user?.cellphoneNumber],
                ["Physical address", user?.physicalAddress],
                ["Job title", user?.jobTitle],
              ].map(([label, value]) => (
                <div key={label} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
                  <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">{label}</p>
                  <p className="mt-2 break-all text-sm font-bold text-[var(--ink)]">{loading ? "Loading..." : displayValue(value)}</p>
                </div>
              ))}

              <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.14em] text-[var(--muted)]">Roles</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(accountRoles.length ? accountRoles : [role]).map((item) => <StatusPill key={item} label={item} tone="confirm" />)}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricCard label="Profile status" value={loading ? "..." : user?.onboardingCompleted === false ? "Incomplete" : "Complete"} detail="Address and cellphone profile" tone={user?.onboardingCompleted === false ? "neutral" : "confirm"} icon={<UserRound className="h-5 w-5" />} />
              <MetricCard label="Account role" value={String(primaryRole)} detail="Current dashboard access" tone="signal" icon={<Settings className="h-5 w-5" />} />
              {workerRole ? <MetricCard label="Tips privilege" value={user?.tipQrCodeEnabled ? "Enabled" : "Not privileged"} detail={user?.tipQrCodeEnabled ? "Owner enabled your tip QR" : "Owner did not enable tips"} tone={user?.tipQrCodeEnabled ? "confirm" : "neutral"} icon={<WalletCards className="h-5 w-5" />} /> : <MetricCard label="Email status" value={emailVerified ? "Verified" : "Action needed"} detail={emailVerified ? "Account email is verified" : "Verify your email address"} tone={emailVerified ? "confirm" : "neutral"} icon={<Mail className="h-5 w-5" />} />}
            </div>

            {shortcuts.length ? (
              <Card>
                <CardHeader><CardTitle>{workerRole ? "Worker shortcuts" : "Account shortcuts"}</CardTitle></CardHeader>
                <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {shortcuts.map(({ label, href, detail, icon: Icon }) => (
                    <Link key={href} href={href} className="group rounded-[1.35rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-[var(--gold)]">
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-[var(--ink)] text-[var(--gold)]"><Icon className="h-4 w-4" /></div>
                      <p className="mt-4 font-black text-[var(--ink)]">{label}</p>
                      <p className="mt-2 text-xs leading-5 text-[var(--steel)]">{detail}</p>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            ) : null}
          </div>
        </section>

        <section className="grid gap-5 xl:grid-cols-2">
          <Card>
            <CardHeader><CardTitle>Update account profile</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Workers and users can maintain the same core account information here.</p></CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="grid gap-4">
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Mail className="h-4 w-4 text-[var(--signal)]" /> Email address</span><input required value={profileForm.emailAddress} onChange={(event) => setProfileForm((current) => ({ ...current, emailAddress: event.target.value }))} type="email" name="emailAddress" autoComplete="email" className={inputClass} placeholder="user@example.com" /></label>
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Phone className="h-4 w-4 text-[var(--signal)]" /> Cellphone number</span><input required value={profileForm.cellphoneNumber} onChange={(event) => setProfileForm((current) => ({ ...current, cellphoneNumber: event.target.value }))} type="tel" name="cellphoneNumber" autoComplete="tel" className={inputClass} placeholder="+27 00 000 0000" /></label>
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><MapPin className="h-4 w-4 text-[var(--signal)]" /> Physical address</span><textarea required value={profileForm.physicalAddress} onChange={(event) => setProfileForm((current) => ({ ...current, physicalAddress: event.target.value }))} name="physicalAddress" className={`${inputClass} min-h-28 py-3`} placeholder="Street, suburb, city and postal code" /></label>
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Image className="h-4 w-4 text-[var(--signal)]" /> Profile picture URL · optional</span><input value={profileForm.profilePictureUrl} onChange={(event) => setProfileForm((current) => ({ ...current, profilePictureUrl: event.target.value }))} type="url" name="profilePictureUrl" className={inputClass} placeholder="https://..." /></label>
                <Button type="submit" disabled={savingProfile}><Settings className="h-4 w-4" /> {savingProfile ? "Saving..." : "Save profile details"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader><CardTitle>Update password</CardTitle></CardHeader>
            <CardContent className="min-w-0">
              <form onSubmit={updatePassword} className="grid min-w-0 gap-4">
                <label className="grid min-w-0 gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><LockKeyhole className="h-4 w-4 text-[var(--signal)]" /> Current password</span><input required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} type="password" name="currentPassword" autoComplete="current-password" className={inputClass} /></label>
                <div className="grid min-w-0 gap-3 sm:grid-cols-2">
                  <label className="grid min-w-0 gap-2"><span className="text-sm font-black text-[var(--ink)]">New password</span><input required minLength={8} value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} type="password" name="newPassword" autoComplete="new-password" className={inputClass} /></label>
                  <label className="grid min-w-0 gap-2"><span className="text-sm font-black text-[var(--ink)]">Confirm password</span><input required minLength={8} value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} type="password" name="confirmPassword" autoComplete="new-password" className={inputClass} /></label>
                </div>
                <Button type="submit" disabled={savingPassword}><LockKeyhole className="h-4 w-4" /> {savingPassword ? "Updating..." : "Update password"}</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
