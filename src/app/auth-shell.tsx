"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Barcode,
  Boxes,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  Megaphone,
  QrCode,
  ShieldCheck,
  Sparkles,
  Ticket,
  UserRound,
  WalletCards,
} from "lucide-react";
import { SocialLinks } from "@/components/social/SocialLinks";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type AuthField = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  defaultValue?: string;
  options?: Array<{ label: string; value: string }>;
  icon?: string;
  helper?: string;
  required?: boolean;
  readOnly?: boolean;
  visibleForPrivileges?: string[];
};

type AuthMode = "login" | "register" | "forgot" | "reset" | "resend";

type AuthShellProps = {
  mode: AuthMode;
  eyebrow: string;
  title: string;
  description: string;
  fields: AuthField[];
  submitLabel: string;
  footerText: string;
  footerHref: string;
  footerLink: string;
  endpoint: string;
  note?: string;
  visualTitle: string;
  visualText: string;
  allowedEmailAddress?: string;
  extraPayload?: Record<string, string>;
};

type AuthStatus = { tone: "success" | "error" | "info"; message: string };

const iconMap: Record<string, ReactNode> = {
  business: <Building2 className="h-4 w-4" />,
  country: <MapPin className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  key: <KeyRound className="h-4 w-4" />,
  lock: <LockKeyhole className="h-4 w-4" />,
  service: <Boxes className="h-4 w-4" />,
  ticket: <Ticket className="h-4 w-4" />,
  tips: <WalletCards className="h-4 w-4" />,
  promo: <Megaphone className="h-4 w-4" />,
  user: <UserRound className="h-4 w-4" />,
};

const trustItems = [
  "Role-aware form fields with no clutter",
  "User, owner, affiliate, worker, and admin dashboard routing",
  "Register keeps the selected service and selected privilege clear",
  "Official profile links on every auth page",
] as const;

const serviceCards = [
  [UserRound, "Free User", "Tickets, job applications, cart-ready checkout, and profile access."],
  [QrCode, "Free Affiliate", "Referral links, QR promotion shell, campaign assets, and commission visibility."],
  [Barcode, "Business Owner", "Barcode inventory, tickets, jobs, workers, tips, capacity, and reports."],
] as const;

const roleSnapshots: Record<string, { title: string; copy: string; tags: string[] }> = {
  USER: {
    title: "Free user account",
    copy: "Minimal registration for ticket buyers, job applicants, cart checkout, profile, and purchase QR flows.",
    tags: ["R0", "Tickets", "Jobs", "Cart"],
  },
  BUSINESS_OWNER: {
    title: "Business owner workspace",
    copy: "Full operator registration for products, scanners, tickets, workers, tips, jobs, promotions, reports, and capacity views.",
    tags: ["Owner", "Barcode", "Workers", "Reports"],
  },
  AFFILIATE: {
    title: "Free affiliate account",
    copy: "Lean promoter registration for referral links, QR promotion assets, commission visibility, and campaign tracking.",
    tags: ["R0", "Referral", "QR", "Campaigns"],
  },
  ADMIN: {
    title: "Restricted admin account",
    copy: "Platform-only registration with locked email validation and admin role metadata.",
    tags: ["Admin", "Locked", "Platform", "Audit"],
  },
};

function payloadFromForm(formData: FormData) {
  const payload: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "terms" || key === "remember" || typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) payload[key] = trimmed;
  }
  return payload;
}

function validatePayload(mode: AuthMode, payload: Record<string, string>, fields: AuthField[], allowedEmailAddress?: string) {
  const missingField = fields.find((field) => field.type !== "hidden" && field.required !== false && !String(payload[field.name] ?? "").trim());
  if (missingField) return `Complete ${missingField.label.toLowerCase()} before submitting.`;
  if (payload.emailAddress && !payload.emailAddress.includes("@")) return "Enter a valid email address.";
  if (allowedEmailAddress && payload.emailAddress?.trim().toLowerCase() !== allowedEmailAddress.trim().toLowerCase()) return `Admin registration is restricted to ${allowedEmailAddress}.`;
  if (mode === "reset" && payload.newPassword !== payload.confirmPassword) return "New password and confirmation must match.";
  return null;
}

function loginRedirectPath() {
  return "/dashboard";
}

function successMessage(mode: AuthMode, responseBody: Record<string, unknown>) {
  if (mode === "login") {
    const user = responseBody.user as { username?: string } | undefined;
    return user?.username ? `Signed in as ${user.username}. Opening your role dashboard.` : "Signed in successfully. Opening your role dashboard.";
  }
  if (mode === "register") return "Workspace created. Check the inbox for the email verification link before signing in.";
  if (mode === "forgot") return "If the account exists, a reset link has been sent.";
  if (mode === "resend") return "If the account needs verification, a new link has been sent.";
  return "Password reset successful. You can now sign in.";
}

function FieldInput({ field, onValueChange }: { field: AuthField; onValueChange?: (name: string, value: string) => void }) {
  const [showPassword, setShowPassword] = useState(false);

  if (field.type === "hidden") {
    return <input type="hidden" name={field.name} value={field.defaultValue ?? ""} />;
  }

  const required = field.required !== false;
  const icon = iconMap[field.icon ?? ""] ?? <Fingerprint className="h-4 w-4" />;
  const isTextarea = field.type === "textarea";
  const helperId = field.helper ? `${field.name}-helper` : undefined;
  const isPassword = field.type === "password";
  const inputType = isPassword && showPassword ? "text" : field.type;

  return (
    <div className="grid gap-2">
      <span className="flex items-center justify-between gap-3">
        <label htmlFor={field.name} className="text-sm font-black text-[var(--ink)]">{field.label}</label>
        {!required ? <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Optional</span> : null}
      </span>
      <span className={`flex border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--gold)] focus-within:shadow-[var(--focus-ring)] ${isTextarea ? "min-h-32 items-start gap-3 rounded-[1.65rem] py-4" : "min-h-12 items-center gap-3 rounded-[1.65rem]"}`}>
        <span className={`shrink-0 text-[var(--signal)] ${isTextarea ? "mt-1" : ""}`}>{icon}</span>
        {field.options ? (
          <select
            id={field.name}
            name={field.name}
            defaultValue={field.defaultValue ?? field.options[0]?.value}
            required={required}
            aria-describedby={helperId}
            onChange={(event) => onValueChange?.(field.name, event.target.value)}
            className="min-h-12 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none"
          >
            {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        ) : isTextarea ? (
          <textarea id={field.name} name={field.name} placeholder={field.placeholder} defaultValue={field.defaultValue} required={required} readOnly={field.readOnly} aria-describedby={helperId} className="min-h-28 w-full resize-none bg-transparent text-sm font-semibold leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--muted)] read-only:text-[var(--steel)]" />
        ) : (
          <>
            <input id={field.name} name={field.name} type={inputType} autoComplete={field.autoComplete} placeholder={field.placeholder} defaultValue={field.defaultValue} required={required} readOnly={field.readOnly} aria-describedby={helperId} className="min-h-12 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] read-only:text-[var(--steel)]" />
            {isPassword ? (
              <button type="button" onClick={() => setShowPassword((current) => !current)} className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--signal)]" aria-label={showPassword ? "Hide password" : "Show password"} aria-pressed={showPassword}>
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            ) : null}
          </>
        )}
      </span>
      {field.helper ? <span id={helperId} className="text-xs font-semibold leading-5 text-[var(--steel)]">{field.helper}</span> : null}
    </div>
  );
}

export function AuthShell({ mode, eyebrow, title, description, fields, submitLabel, footerText, footerHref, footerLink, endpoint, note, visualTitle, visualText, allowedEmailAddress, extraPayload }: AuthShellProps) {
  const initialPrivilege = fields.find((field) => field.name === "serviceRegisteringFor")?.defaultValue ?? "BUSINESS_OWNER";
  const [selectedPrivilege, setSelectedPrivilege] = useState(initialPrivilege);
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeNote = useMemo(() => note ?? (mode === "register" ? "Choose the role first. The form renders only the fields that role needs, keeping User and Affiliate registration free and clean." : null), [mode, note]);
  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const visibleFields = useMemo(
    () => fields.filter((field) => !field.visibleForPrivileges || field.visibleForPrivileges.includes(selectedPrivilege) || field.type === "hidden" || field.name === "serviceRegisteringFor" || field.name === "serviceRegistrationType"),
    [fields, selectedPrivilege],
  );
  const roleSnapshot = roleSnapshots[selectedPrivilege];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const payload = { ...payloadFromForm(new FormData(form)), ...(extraPayload ?? {}) };
      const validationError = validatePayload(mode, payload, visibleFields, allowedEmailAddress);
      if (validationError) {
        setStatus({ tone: "error", message: validationError });
        return;
      }

      const response = await axios.post<Record<string, unknown>>(endpoint, payload, { withCredentials: true });
      const responseBody = response.data;
      if (!isLogin) form.reset();
      setStatus({ tone: "success", message: successMessage(mode, responseBody) });
      if (isLogin) window.setTimeout(() => { window.location.href = loginRedirectPath(); }, 400);
      if (mode === "reset") window.setTimeout(() => { window.location.href = "/login"; }, 700);
    } catch (error) {
      setStatus({ tone: "error", message: axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to reach the auth API." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--surface)] text-[var(--ink)]">
      <div className="pointer-events-none absolute inset-0 enterprise-grid opacity-80" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[var(--gold)]/20 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[var(--ember)]/14 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-6 md:px-8 lg:grid-cols-[0.98fr_1.02fr] lg:items-center lg:py-10">
        <section className="order-2 lg:order-1">
          <Link href="/" aria-label="King Sparkon Tracker home" className="inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/76 px-3 py-2 shadow-[var(--shadow-soft)] backdrop-blur">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={50} height={50} className="rounded-[1.2rem] border border-[var(--line)] bg-white p-1.5" priority />
            <div>
              <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.2em] text-[var(--signal)]">King Sparkon</p>
              <p className="text-lg font-black uppercase tracking-[-0.04em]">Tracker</p>
            </div>
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]"><Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> {eyebrow}</div>
            <h1 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.06em] md:text-6xl">{title}</h1>
            <p className="mt-5 text-sm leading-7 text-[var(--steel)] md:text-base">{description}</p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-white/88 p-5 shadow-[var(--shadow-ledger)] backdrop-blur md:p-7">
            <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Secure workspace entry</p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] md:text-3xl">{visualTitle}</h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--steel)]">{visualText}</p>
              </div>
              <div className="grid h-13 w-13 shrink-0 place-items-center rounded-[1.35rem] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">{isLogin ? <ShieldCheck className="h-6 w-6" /> : <Barcode className="h-6 w-6" />}</div>
            </div>

            {activeNote ? <div className="mt-5 flex gap-3 rounded-[1.5rem] border border-[var(--gold)]/45 bg-[var(--gold)]/10 p-4 text-sm font-semibold leading-6 text-[var(--steel)]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" /><span>{activeNote}</span></div> : null}

            {isRegister && roleSnapshot ? (
              <div className="mt-5 rounded-[1.75rem] border border-[var(--line)] bg-[var(--ink)] p-4 text-white shadow-[var(--shadow-soft)]">
                <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-[var(--gold)]">Selected role</p>
                <h3 className="mt-2 text-2xl font-black tracking-[-0.04em]">{roleSnapshot.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/68">{roleSnapshot.copy}</p>
                <div className="mt-4 flex flex-wrap gap-2">{roleSnapshot.tags.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-white/72">{tag}</span>)}</div>
              </div>
            ) : null}

            <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
              <div className={isRegister ? "grid gap-5 md:grid-cols-2" : "grid gap-5"}>{visibleFields.map((field) => <FieldInput key={field.name} field={field} onValueChange={(name, value) => { if (name === "serviceRegisteringFor") setSelectedPrivilege(value); }} />)}</div>
              {isLogin ? <div className="flex flex-col gap-3 text-sm font-bold text-[var(--steel)] sm:flex-row sm:items-center sm:justify-between"><label className="inline-flex items-center gap-2"><input type="checkbox" name="remember" className="h-4 w-4 rounded border-[var(--line)] accent-[var(--signal)]" />Remember this device</label><div className="flex flex-wrap gap-3"><Link href="/resend-verification" className="text-[var(--signal)] hover:text-[var(--ember)]">Resend verification</Link><Link href="/forgot-password" className="text-[var(--signal)] hover:text-[var(--ember)]">Forgot password?</Link></div></div> : null}
              {isRegister ? <label className="flex items-start gap-3 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-semibold leading-6 text-[var(--steel)]"><input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-[var(--signal)]" /><span>I confirm this account is being created for the selected King Sparkon role and service.</span></label> : null}
              {status ? <div aria-live="polite" role={status.tone === "error" ? "alert" : "status"} className={`flex gap-3 rounded-[1.5rem] border px-4 py-3 text-sm font-semibold leading-6 ${status.tone === "error" ? "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]" : "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]"}`}>{status.tone === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}<span>{status.message}</span></div> : null}
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(29,92,131,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-[var(--ink)] disabled:opacity-55 sm:w-auto sm:justify-self-start">
                {isSubmitting ? "Submitting..." : submitLabel} <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-sm font-bold text-[var(--steel)]">{footerText} <Link href={footerHref} className="font-black text-[var(--signal)] hover:text-[var(--ember)]">{footerLink}</Link></p></div>
            <div className="mt-6 border-t border-[var(--line)] pt-6"><p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p><SocialLinks variant="light" /></div>
          </div>
        </section>

        <aside className="order-1 lg:order-2">
          <div className="relative mx-auto max-w-xl [perspective:1200px]">
            <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-[var(--gold)]/28 via-white to-[var(--ember)]/18 blur-2xl" />
            <div className="relative rounded-[2.75rem] border border-[var(--line)] bg-white/86 p-4 shadow-[var(--shadow-depth)] backdrop-blur [transform:rotateX(3deg)_rotateY(-6deg)] md:p-5">
              <div className="overflow-hidden rounded-[2.25rem] border border-white/10 bg-[var(--ink)] text-white enterprise-grid">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Auth terminal</p><p className="mt-1 text-sm font-semibold text-white/62">King Sparkon Tracker access</p></div><span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black text-white/78">Ready</span></div>
                <div className="grid gap-4 p-5"><div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5"><div className="barcode-rule h-16 text-white" /><div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-white/48"><span>Workspace</span><span>{isRegister ? "Role selected" : "Secure login"}</span></div></div><div className="grid gap-3">{trustItems.map((point) => <div key={point} className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/68"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--gold)]" />{point}</div>)}</div></div>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {serviceCards.map(([Icon, heading, copy]) => (
              <article key={heading} className="rounded-[1.6rem] border border-[var(--line)] bg-white/82 p-4 shadow-[var(--shadow-soft)] backdrop-blur">
                <Icon className="h-5 w-5 text-[var(--signal)]" />
                <h3 className="mt-3 text-sm font-black tracking-[-0.02em]">{heading}</h3>
                <p className="mt-2 text-xs leading-5 text-[var(--steel)]">{copy}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
