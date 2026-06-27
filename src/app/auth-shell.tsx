"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { AlertCircle, ArrowRight, Barcode, Building2, CheckCircle2, Eye, Fingerprint, KeyRound, LockKeyhole, Mail, MapPin, ShieldCheck, Sparkles, UserRound } from "lucide-react";
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
};

type AuthStatus = { tone: "success" | "error" | "info"; message: string };

const iconMap: Record<string, ReactNode> = {
  business: <Building2 className="h-4 w-4" />,
  country: <MapPin className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  key: <KeyRound className="h-4 w-4" />,
  lock: <LockKeyhole className="h-4 w-4" />,
  user: <UserRound className="h-4 w-4" />,
};

const trustItems = ["Owner, worker, affiliate and admin routing", "Clear field examples for every input", "White rounded UI instead of the old square auth look", "Official profile links on every auth page"] as const;

function payloadFromForm(formData: FormData) {
  const payload: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "terms" || key === "remember" || typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) payload[key] = trimmed;
  }
  return payload;
}

function validatePayload(mode: AuthMode, payload: Record<string, string>, fields: AuthField[]) {
  const missingField = fields.find((field) => field.required !== false && !String(payload[field.name] ?? "").trim());
  if (missingField) return `Complete ${missingField.label.toLowerCase()} before submitting.`;
  if (payload.emailAddress && !payload.emailAddress.includes("@")) return "Enter a valid email address.";
  if (mode === "reset" && payload.newPassword !== payload.confirmPassword) return "New password and confirmation must match.";
  return null;
}

function dashboardPath(responseBody: Record<string, unknown>) {
  const user = responseBody.user as { privilege?: string; roles?: string[] } | undefined;
  const roles = user?.roles ?? [user?.privilege ?? ""];
  const roleText = roles.join(" ").toLowerCase();
  if (roleText.includes("admin")) return "/dashboard/admin";
  if (roleText.includes("affiliate")) return "/dashboard/affiliate";
  if (roleText.includes("worker")) return "/dashboard/worker";
  if (roleText.includes("owner")) return "/dashboard/owner";
  return "/dashboard";
}

function successMessage(mode: AuthMode, responseBody: Record<string, unknown>) {
  if (mode === "login") {
    const user = responseBody.user as { username?: string } | undefined;
    return user?.username ? `Signed in as ${user.username}.` : "Signed in successfully.";
  }
  if (mode === "register") return "Workspace created. Check the inbox for the email verification link before signing in.";
  if (mode === "forgot") return "If the account exists, a reset link has been sent.";
  if (mode === "resend") return "If the account needs verification, a new link has been sent.";
  return "Password reset successful. You can now sign in.";
}

function FieldInput({ field }: { field: AuthField }) {
  const required = field.required !== false;
  const icon = iconMap[field.icon ?? ""] ?? <Fingerprint className="h-4 w-4" />;
  const isTextarea = field.type === "textarea";
  const helperId = field.helper ? `${field.name}-helper` : undefined;

  return (
    <label className="grid gap-2" htmlFor={field.name}>
      <span className="flex items-center justify-between gap-3">
        <span className="text-sm font-black text-[var(--ink)]">{field.label}</span>
        {!required ? <span className="text-xs font-bold uppercase tracking-[0.12em] text-[var(--muted)]">Optional</span> : null}
      </span>
      <span className={`flex border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)] ${isTextarea ? "min-h-32 items-start gap-3 rounded-[1.65rem] py-4" : "min-h-12 items-center gap-3 rounded-[1.65rem]"}`}>
        <span className={`shrink-0 text-[var(--signal)] ${isTextarea ? "mt-1" : ""}`}>{icon}</span>
        {field.options ? (
          <select id={field.name} name={field.name} defaultValue={field.defaultValue ?? field.options[0]?.value} required={required} aria-describedby={helperId} className="min-h-12 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none">
            {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        ) : isTextarea ? (
          <textarea id={field.name} name={field.name} placeholder={field.placeholder} defaultValue={field.defaultValue} required={required} aria-describedby={helperId} className="min-h-28 w-full resize-none bg-transparent text-sm font-semibold leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
        ) : (
          <>
            <input id={field.name} name={field.name} type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} defaultValue={field.defaultValue} required={required} aria-describedby={helperId} className="min-h-12 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)]" />
            {field.type === "password" ? <Eye className="h-4 w-4 shrink-0 text-[var(--muted)]" aria-hidden="true" /> : null}
          </>
        )}
      </span>
      {field.helper ? <span id={helperId} className="text-xs font-semibold leading-5 text-[var(--steel)]">{field.helper}</span> : null}
    </label>
  );
}

export function AuthShell({ mode, eyebrow, title, description, fields, submitLabel, footerText, footerHref, footerLink, endpoint, note, visualTitle, visualText }: AuthShellProps) {
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeNote = useMemo(() => note ?? (mode === "register" ? "Owners, affiliates, and admins must verify email before login when backend policy enforces it." : null), [mode, note]);
  const isLogin = mode === "login";
  const isRegister = mode === "register";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    try {
      const form = event.currentTarget;
      const payload = payloadFromForm(new FormData(form));
      const validationError = validatePayload(mode, payload, fields);
      if (validationError) {
        setStatus({ tone: "error", message: validationError });
        return;
      }
      const response = await axios.post<Record<string, unknown>>(endpoint, payload, { withCredentials: true });
      const responseBody = response.data;
      if (!isLogin) form.reset();
      setStatus({ tone: "success", message: successMessage(mode, responseBody) });
      if (isLogin) window.setTimeout(() => { window.location.href = dashboardPath(responseBody); }, 400);
      if (mode === "reset") window.setTimeout(() => { window.location.href = "/login"; }, 700);
    } catch (error) {
      setStatus({ tone: "error", message: axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to reach the auth API." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-[var(--ink)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-12rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[var(--gold)]/18 blur-3xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[34rem] w-[34rem] rounded-full bg-[var(--signal)]/12 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-6 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:py-10">
        <section className="order-2 lg:order-1">
          <Link href="/" aria-label="King Sparkon Tracker home" className="inline-flex items-center gap-3">
            <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker barcode logo" width={54} height={54} className="rounded-[1.35rem] border border-[var(--line)] bg-white p-1.5 shadow-[var(--shadow-soft)]" priority />
            <div><p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.2em] text-[var(--signal)]">King Sparkon</p><p className="text-xl font-black uppercase tracking-[-0.04em]">Tracker</p></div>
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]"><Sparkles className="h-3.5 w-3.5 text-[var(--signal)]" /> {eyebrow}</div>
            <h1 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.06em] md:text-6xl">{title}</h1>
            <p className="mt-5 text-sm leading-7 text-[var(--steel)] md:text-base">{description}</p>
          </div>

          <div className="mt-8 overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-ledger)] md:p-7">
            <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
              <div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Secure workspace entry</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em] md:text-3xl">{visualTitle}</h2><p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--steel)]">{visualText}</p></div>
              <div className="grid h-13 w-13 shrink-0 place-items-center rounded-[1.35rem] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">{isLogin ? <ShieldCheck className="h-6 w-6" /> : <Barcode className="h-6 w-6" />}</div>
            </div>

            {activeNote ? <div className="mt-5 flex gap-3 rounded-[1.5rem] border border-[var(--gold)]/45 bg-[var(--surface)] p-4 text-sm font-semibold leading-6 text-[var(--steel)]"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" /><span>{activeNote}</span></div> : null}

            <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
              <div className={isRegister ? "grid gap-5 md:grid-cols-2" : "grid gap-5"}>{fields.map((field) => <FieldInput key={field.name} field={field} />)}</div>
              {isLogin ? <div className="flex flex-col gap-3 text-sm font-bold text-[var(--steel)] sm:flex-row sm:items-center sm:justify-between"><label className="inline-flex items-center gap-2"><input type="checkbox" name="remember" className="h-4 w-4 rounded border-[var(--line)] accent-[var(--signal)]" />Remember this device</label><div className="flex flex-wrap gap-3"><Link href="/resend-verification" className="text-[var(--signal)] hover:text-[var(--ember)]">Resend verification</Link><Link href="/forgot-password" className="text-[var(--signal)] hover:text-[var(--ember)]">Forgot password?</Link></div></div> : null}
              {isRegister ? <label className="flex items-start gap-3 rounded-[1.5rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-semibold leading-6 text-[var(--steel)]"><input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-[var(--signal)]" /><span>I confirm this account will manage a business-scoped King Sparkon Tracker workspace.</span></label> : null}
              {status ? <div aria-live="polite" className={`flex gap-3 rounded-[1.5rem] border px-4 py-3 text-sm font-semibold leading-6 ${status.tone === "error" ? "border-[var(--signal)] bg-[var(--signal)]/10 text-[var(--ember)]" : "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]"}`}>{status.tone === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}<span>{status.message}</span></div> : null}
              <button type="submit" disabled={isSubmitting} className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)] disabled:pointer-events-none disabled:opacity-60">{isSubmitting ? "Working..." : submitLabel} <ArrowRight className="h-4 w-4" /></button>
            </form>

            <div className="mt-6 rounded-[1.75rem] border border-[var(--line)] bg-[var(--surface)] p-4"><p className="text-sm font-bold text-[var(--steel)]">{footerText} <Link href={footerHref} className="font-black text-[var(--signal)] hover:text-[var(--ember)]">{footerLink}</Link></p></div>
            <div className="mt-6 border-t border-[var(--line)] pt-6"><p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p><SocialLinks variant="light" /></div>
          </div>
        </section>

        <aside className="order-1 lg:order-2">
          <div className="relative mx-auto max-w-xl [perspective:1200px]"><div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-[var(--gold)]/28 via-white to-[var(--signal)]/18 blur-2xl" /><div className="relative rounded-[2.75rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-depth)] [transform:rotateX(3deg)_rotateY(-6deg)] md:p-5"><div className="overflow-hidden rounded-[2.25rem] border border-[var(--line)] bg-[var(--ink)] text-white"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="font-mono text-[0.62rem] font-black uppercase tracking-[0.18em] text-[var(--gold)]">Auth terminal</p><p className="mt-1 text-sm font-semibold text-white/62">King Sparkon Tracker access</p></div><span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black text-white/78">Ready</span></div><div className="grid gap-4 p-5"><div className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5"><div className="barcode-rule h-16 text-white" /><div className="mt-4 flex items-center justify-between text-xs font-bold uppercase tracking-[0.14em] text-white/48"><span>Workspace</span><span>Verified</span></div></div><div className="grid gap-3">{trustItems.map((point) => <div key={point} className="flex items-center gap-3 rounded-[1.35rem] border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white/68"><CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--gold)]" />{point}</div>)}</div></div></div></div></div>
        </aside>
      </div>
    </main>
  );
}
