"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BadgeDollarSign,
  Boxes,
  BriefcaseBusiness,
  CreditCard,
  ImageUp,
  Link2,
  LockKeyhole,
  Mail,
  MapPin,
  Megaphone,
  PackageSearch,
  Phone,
  Save,
  ScanLine,
  ShoppingCart,
  Ticket,
  UserRound,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusPill } from "@/components/ui/StatusPill";
import { apiClient, apiGet, apiPatch, normalizeApiError } from "@/lib/api/client";
import type { TrackerUser, UserRole } from "@/lib/types/backend";

type AffiliateProfileResponse = {
  id: number;
  username: string;
  emailAddress: string;
  physicalAddress?: string | null;
  cellphoneNumber?: string | null;
  profilePictureUrl?: string | null;
  onboardingCompleted?: boolean;
  paypalLink?: string | null;
  affiliateCode?: string | null;
  promotionUrl?: string | null;
  qrCodeUrl?: string | null;
  affiliateJoinedAt?: string | null;
};

type EditableProfile = TrackerUser & {
  physicalAddress?: string | null;
  cellphoneNumber?: string | null;
  profilePictureUrl?: string | null;
  jobTitle?: string | null;
  tipQrCodeEnabled?: boolean;
  onboardingCompleted?: boolean;
  affiliateCode?: string | null;
  affiliatePromotionUrl?: string | null;
  affiliateQrCodeUrl?: string | null;
  affiliatePaypalLink?: string | null;
  affiliateJoinedAt?: string | null;
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
  paypalLink: string;
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

const affiliateShortcuts: ProfileShortcut[] = [
  { label: "Referral Links", href: "/dashboard/affiliate/referrals", detail: "Copy your production-safe tracked link.", icon: Link2 },
  { label: "Campaign Posters", href: "/dashboard/affiliate/assets", detail: "Download administrator-approved posters.", icon: Megaphone },
  { label: "Affiliate Leads", href: "/dashboard/affiliate/leads", detail: "Review contacts, niches and lead angles.", icon: UsersRound },
  { label: "Commissions", href: "/dashboard/affiliate/commissions", detail: "Review approved affiliate earnings.", icon: BadgeDollarSign },
  { label: "Payouts", href: "/dashboard/affiliate/payouts", detail: "Cash out approved commissions.", icon: WalletCards },
];

function roles(user?: TrackerUser | null) {
  const raw = user?.roles?.length ? user.roles : user?.privilege ? [user.privilege] : [];
  return raw.map(String).filter(Boolean);
}

function displayValue(value?: string | number | null) {
  if (value === undefined || value === null || value === "") return "Not set";
  return String(value);
}

function productionReferralUrl(rawUrl?: string | null, code?: string | null) {
  const safeCode = code?.trim() || "";
  const path = `/pricing?affiliateCode=${encodeURIComponent(safeCode)}`;
  if (typeof window === "undefined") return rawUrl || path;
  try {
    const parsed = new URL(rawUrl || path, window.location.origin);
    if (["localhost", "127.0.0.1", "0.0.0.0"].includes(parsed.hostname)) {
      return new URL(path, window.location.origin).toString();
    }
    return parsed.toString();
  } catch {
    return new URL(path, window.location.origin).toString();
  }
}

function mergeAffiliateProfile(base: EditableProfile, affiliate: AffiliateProfileResponse): EditableProfile {
  return {
    ...base,
    emailAddress: affiliate.emailAddress || base.emailAddress,
    physicalAddress: affiliate.physicalAddress ?? base.physicalAddress,
    cellphoneNumber: affiliate.cellphoneNumber ?? base.cellphoneNumber,
    profilePictureUrl: affiliate.profilePictureUrl ?? base.profilePictureUrl,
    onboardingCompleted: affiliate.onboardingCompleted ?? base.onboardingCompleted,
    affiliateCode: affiliate.affiliateCode,
    affiliatePromotionUrl: productionReferralUrl(affiliate.promotionUrl, affiliate.affiliateCode),
    affiliateQrCodeUrl: affiliate.qrCodeUrl,
    affiliatePaypalLink: affiliate.paypalLink,
    affiliateJoinedAt: affiliate.affiliateJoinedAt,
  };
}

const inputClass = "min-h-12 min-w-0 w-full rounded-[1.1rem] border border-[var(--line)] bg-white px-4 text-sm font-bold outline-none focus:border-[var(--signal)]";

export function ProfileWorkspace({ role }: { role: UserRole }) {
  const affiliateRole = role === "Affiliate";
  const workerRole = role === "Worker";
  const [user, setUser] = useState<EditableProfile | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileForm>({ emailAddress: "", physicalAddress: "", cellphoneNumber: "", paypalLink: "" });
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedPreviewUrl = useMemo(() => (profilePictureFile ? URL.createObjectURL(profilePictureFile) : null), [profilePictureFile]);

  useEffect(() => () => {
    if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
  }, [selectedPreviewUrl]);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      setLoading(true);
      setError(null);
      try {
        const baseUser = await apiGet<EditableProfile>("/users/me");
        const nextUser = affiliateRole
          ? mergeAffiliateProfile(baseUser, await apiGet<AffiliateProfileResponse>("/affiliates/me"))
          : baseUser;
        if (!mounted) return;
        setUser(nextUser);
        setProfileForm({
          emailAddress: nextUser.emailAddress ?? "",
          physicalAddress: nextUser.physicalAddress ?? "",
          cellphoneNumber: nextUser.cellphoneNumber ?? "",
          paypalLink: nextUser.affiliatePaypalLink ?? "",
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
  }, [affiliateRole]);

  const accountRoles = roles(user);
  const primaryRole = accountRoles[0] ?? role;
  const emailVerified = user?.emailVerified !== false;
  const shortcuts = workerRole ? workerShortcuts : affiliateRole ? affiliateShortcuts : role === "User" ? userShortcuts : [];
  const trackedLink = affiliateRole ? productionReferralUrl(user?.affiliatePromotionUrl, user?.affiliateCode) : "";
  const displayedPhoto = selectedPreviewUrl || user?.profilePictureUrl || null;

  async function updateProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingProfile(true);
    setError(null);
    setNotice(null);
    try {
      const corePayload = {
        emailAddress: profileForm.emailAddress,
        physicalAddress: profileForm.physicalAddress,
        cellphoneNumber: profileForm.cellphoneNumber,
        profilePictureUrl: user?.profilePictureUrl ?? "",
      };
      let updatedUser = await apiPatch<EditableProfile, typeof corePayload>("/users/me", corePayload);

      if (affiliateRole) {
        const affiliateProfile = await apiPatch<AffiliateProfileResponse, {
          physicalAddress: string;
          cellphoneNumber: string;
          paypalLink: string;
          profilePictureUrl: string;
        }>("/affiliates/me/onboarding", {
          physicalAddress: profileForm.physicalAddress,
          cellphoneNumber: profileForm.cellphoneNumber,
          paypalLink: profileForm.paypalLink,
          profilePictureUrl: updatedUser.profilePictureUrl ?? "",
        });
        updatedUser = mergeAffiliateProfile(updatedUser, affiliateProfile);
      }

      if (profilePictureFile) {
        const formData = new FormData();
        formData.set("file", profilePictureFile);
        const response = await apiClient.post<EditableProfile>("/users/me/profile-picture", formData);
        updatedUser = { ...updatedUser, ...response.data, affiliatePaypalLink: updatedUser.affiliatePaypalLink };
        setProfilePictureFile(null);
      }

      setUser(updatedUser);
      setProfileForm({
        emailAddress: updatedUser.emailAddress ?? profileForm.emailAddress,
        physicalAddress: updatedUser.physicalAddress ?? profileForm.physicalAddress,
        cellphoneNumber: updatedUser.cellphoneNumber ?? profileForm.cellphoneNumber,
        paypalLink: updatedUser.affiliatePaypalLink ?? profileForm.paypalLink,
      });
      setNotice(updatedUser.emailVerified === false ? "Profile updated. Verify the changed email address before protected email flows." : "Profile details and uploaded photo were saved.");
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

  async function copyTrackedLink() {
    if (!trackedLink) return;
    await navigator.clipboard.writeText(trackedLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <DashboardHeader
        role={`${role.toUpperCase()} PROFILE`}
        title="Profile"
        description={affiliateRole ? "Manage affiliate identity, contact details, uploaded profile photo, tracked link, PayPal payout account and password." : workerRole ? "Update your worker account details, address, uploaded profile photo and password. Tips access is controlled by the business owner." : "View and update your account contact, address, uploaded profile photo and password."}
      />
      <main className="grid gap-6 bg-[var(--surface)] p-5 md:p-8">
        {error ? <p className="rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        {notice ? <p className="rounded-[var(--radius-lg)] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-4 text-sm font-bold text-[var(--ink)]">{notice}</p> : null}

        <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
          <Card className="overflow-hidden bg-white">
            <div className="bg-[var(--ink)] p-6 text-white enterprise-grid">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-[1.35rem] border border-white/15 bg-white/10 text-[var(--gold)]">
                {displayedPhoto ? <img src={displayedPhoto} alt={user?.username ?? "Profile"} className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}
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
                ...(affiliateRole ? [["Affiliate code", user?.affiliateCode], ["PayPal payout", user?.affiliatePaypalLink]] : []),
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4">
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
              <MetricCard label="Profile status" value={loading ? "..." : user?.onboardingCompleted === false ? "Incomplete" : "Complete"} detail="Address, cellphone and payout details" tone={user?.onboardingCompleted === false ? "neutral" : "confirm"} icon={<UserRound className="h-5 w-5" />} />
              <MetricCard label="Account role" value={String(primaryRole)} detail="Current dashboard access" tone="signal" icon={<BriefcaseBusiness className="h-5 w-5" />} />
              {workerRole ? <MetricCard label="Tips privilege" value={user?.tipQrCodeEnabled ? "Enabled" : "Not privileged"} detail={user?.tipQrCodeEnabled ? "Owner enabled your tip QR" : "Owner did not enable tips"} tone={user?.tipQrCodeEnabled ? "confirm" : "neutral"} icon={<WalletCards className="h-5 w-5" />} /> : <MetricCard label="Email status" value={emailVerified ? "Verified" : "Action needed"} detail={emailVerified ? "Account email is verified" : "Verify your email address"} tone={emailVerified ? "confirm" : "neutral"} icon={<Mail className="h-5 w-5" />} />}
            </div>

            {affiliateRole ? (
              <Card>
                <CardHeader><CardTitle>Primary tracked link</CardTitle></CardHeader>
                <CardContent className="grid gap-3">
                  <p className="break-all rounded-[1.15rem] border border-[var(--line)] bg-[var(--surface)] p-4 font-mono text-sm font-black text-[var(--ink)]">{trackedLink || "Affiliate link is being prepared."}</p>
                  <Button type="button" variant="quiet" onClick={() => void copyTrackedLink()}><Link2 className="h-4 w-4" /> {copied ? "Tracked link copied" : "Copy tracked link"}</Button>
                </CardContent>
              </Card>
            ) : null}

            {shortcuts.length ? (
              <Card>
                <CardHeader><CardTitle>{affiliateRole ? "Affiliate tools" : workerRole ? "Worker shortcuts" : "Account shortcuts"}</CardTitle></CardHeader>
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
            <CardHeader><CardTitle>Update account profile</CardTitle><p className="mt-2 text-sm leading-6 text-[var(--steel)]">Choose a photo file from your device. Image URLs are no longer entered manually.</p></CardHeader>
            <CardContent>
              <form onSubmit={updateProfile} className="grid gap-4">
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Mail className="h-4 w-4 text-[var(--signal)]" /> Email address</span><input required value={profileForm.emailAddress} onChange={(event) => setProfileForm((current) => ({ ...current, emailAddress: event.target.value }))} type="email" autoComplete="email" className={inputClass} /></label>
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><Phone className="h-4 w-4 text-[var(--signal)]" /> Cellphone number</span><input required value={profileForm.cellphoneNumber} onChange={(event) => setProfileForm((current) => ({ ...current, cellphoneNumber: event.target.value }))} type="tel" autoComplete="tel" className={inputClass} placeholder="+27 00 000 0000" /></label>
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><MapPin className="h-4 w-4 text-[var(--signal)]" /> Physical address</span><textarea required value={profileForm.physicalAddress} onChange={(event) => setProfileForm((current) => ({ ...current, physicalAddress: event.target.value }))} className={`${inputClass} min-h-28 py-3`} /></label>
                {affiliateRole ? <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><WalletCards className="h-4 w-4 text-[var(--signal)]" /> PayPal payout link</span><input required value={profileForm.paypalLink} onChange={(event) => setProfileForm((current) => ({ ...current, paypalLink: event.target.value }))} type="url" className={inputClass} placeholder="https://paypal.me/your-account" /></label> : null}
                <label className="grid gap-3 rounded-[1.25rem] border border-dashed border-[var(--line-strong)] bg-[var(--surface)] p-4">
                  <span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><ImageUp className="h-4 w-4 text-[var(--signal)]" /> Upload profile photo</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => setProfilePictureFile(event.target.files?.[0] ?? null)} className="text-sm font-bold text-[var(--steel)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:font-black file:text-white" />
                  <p className="text-xs leading-5 text-[var(--muted)]">PNG, JPEG, WebP or GIF. The file is uploaded to managed storage when you save.</p>
                  {displayedPhoto ? <img src={displayedPhoto} alt="Selected profile preview" className="h-28 w-28 rounded-[1.2rem] object-cover shadow-[var(--shadow-soft)]" /> : null}
                </label>
                <Button type="submit" disabled={savingProfile}><Save className="h-4 w-4" /> {savingProfile ? "Saving profile..." : "Save profile and photo"}</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader><CardTitle>Update password</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={updatePassword} className="grid gap-4">
                <label className="grid gap-2"><span className="inline-flex items-center gap-2 text-sm font-black text-[var(--ink)]"><LockKeyhole className="h-4 w-4 text-[var(--signal)]" /> Current password</span><input required value={passwordForm.currentPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, currentPassword: event.target.value }))} type="password" autoComplete="current-password" className={inputClass} /></label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-2"><span className="text-sm font-black text-[var(--ink)]">New password</span><input required minLength={8} value={passwordForm.newPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, newPassword: event.target.value }))} type="password" autoComplete="new-password" className={inputClass} /></label>
                  <label className="grid gap-2"><span className="text-sm font-black text-[var(--ink)]">Confirm password</span><input required minLength={8} value={passwordForm.confirmPassword} onChange={(event) => setPasswordForm((current) => ({ ...current, confirmPassword: event.target.value }))} type="password" autoComplete="new-password" className={inputClass} /></label>
                </div>
                <Button type="submit" disabled={savingPassword}><LockKeyhole className="h-4 w-4" /> {savingPassword ? "Updating password..." : "Update password"}</Button>
              </form>
            </CardContent>
          </Card>
        </section>
      </main>
    </>
  );
}
