"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Barcode,
  Building2,
  CheckCircle2,
  Eye,
  Fingerprint,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
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

const securityMetrics = [
  ["HTTPONLY", "Session"],
  ["ROLE", "Guard"],
  ["RATE", "Cooldown"],
] as const;

const authTrustPoints = [
  "Rounded premium form language",
  "SEO-ready auth entry points",
  "Social profiles linked from every auth page",
  "Built for owner, worker, affiliate and admin routing",
] as const;

const iconMap: Record<string, ReactNode> = {
  business: <Building2 className="h-4 w-4" />,
  country: <MapPin className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  key: <KeyRound className="h-4 w-4" />,
  lock: <LockKeyhole className="h-4 w-4" />,
  user: <UserRound className="h-4 w-4" />,
};

function payloadFromForm(formData: FormData) {
  const payload: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (key === "terms" || key === "remember" || typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (trimmed) {
      payload[key] = trimmed;
    }
  }

  return payload;
}

function validatePayload(mode: AuthMode, payload: Record<string, string>) {
  const required = Object.entries(payload).filter(([key]) => key !== "affiliateCode" && key !== "businessDescription" && key !== "physicalAddress" && key !== "cellphoneNumber");

  if (required.some(([, value]) => !value)) {
    return "Complete every required field before submitting.";
  }

  if (payload.emailAddress && !payload.emailAddress.includes("@")) {
    return "Enter a valid email address.";
  }

  if (mode === "reset" && payload.newPassword !== payload.confirmPassword) {
    return "New password and confirmation must match.";
  }

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

  if (mode === "register") {
    return "Workspace created. Check the inbox for the email verification link before signing in.";
  }

  if (mode === "forgot") return "If the account exists, a reset link has been sent.";
  if (mode === "resend") return "If the account needs verification, a new link has been sent.";
  return "Password reset successful. You can now sign in.";
}

function FieldInput({ field }: { field: AuthField }) {
  const required = field.required !== false;
  const icon = iconMap[field.icon ?? ""] ?? <Fingerprint className="h-4 w-4" />;
  const isTextarea = field.type === "textarea";

  return (
    <label className="grid gap-2" htmlFor={field.name}>
      <span className="text-sm font-black text-[var(--ink)]">{field.label}</span>
      <span
        className={`flex border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:shadow-[var(--focus-ring)] ${
          isTextarea ? "min-h-32 items-start gap-3 rounded-[1.65rem] py-4" : "min-h-13 items-center gap-3 rounded-full"
        }`}
      >
        <span className={`shrink-0 text-[var(--signal)] ${isTextarea ? "mt-1" : ""}`}>{icon}</span>
        {field.options ? (
          <select
            id={field.name}
            name={field.name}
            defaultValue={field.defaultValue ?? field.options[0]?.value}
            required={required}
            className="min-h-12 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : isTextarea ? (
          <textarea
            id={field.name}
            name={field.name}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            required={required}
            className="min-h-28 w-full resize-none bg-transparent text-sm font-semibold leading-6 text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
          />
        ) : (
          <>
            <input
              id={field.name}
              name={field.name}
              type={field.type}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              defaultValue={field.defaultValue}
              required={required}
              className="min-h-12 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)]"
            />
            {field.type === "password" ? <Eye className="h-4 w-4 shrink-0 text-[var(--muted)]" aria-hidden="true" /> : null}
          </>
        )}
      </span>
    </label>
  );
}

export function AuthShell({
  mode,
  eyebrow,
  title,
  description,
  fields,
  submitLabel,
  footerText,
  footerHref,
  footerLink,
  endpoint,
  note,
  visualTitle,
  visualText,
}: AuthShellProps) {
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
      const validationError = validatePayload(mode, payload);

      if (validationError) {
        setStatus({ tone: "error", message: validationError });
        return;
      }

      const response = await axios.post<Record<string, unknown>>(endpoint, payload, { withCredentials: true });
      const responseBody = response.data;

      if (!isLogin) {
        form.reset();
      }

      setStatus({ tone: "success", message: successMessage(mode, responseBody) });

      if (isLogin) {
        window.setTimeout(() => {
          window.location.href = dashboardPath(responseBody);
        }, 400);
      }

      if (mode === "reset") {
        window.setTimeout(() => {
          window.location.href = "/login";
        }, 700);
      }
    } catch (error) {
      setStatus({ tone: "error", message: axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to reach the auth API." });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--ink)] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-14rem] top-[-10rem] h-[34rem] w-[34rem] rounded-full bg-[var(--gold)]/15 blur-3xl" />
        <div className="absolute bottom-[-14rem] right-[-8rem] h-[38rem] w-[38rem] rounded-full bg-[var(--signal)]/16 blur-3xl" />
        <div className="absolute left-1/2 top-0 h-px w-[86%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[var(--gold)]/50 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-6 md:px-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center lg:py-10">
        <aside className="flex min-h-[42rem] flex-col justify-between rounded-[2.5rem] border border-white/10 bg-white/[0.055] p-6 shadow-[var(--shadow-depth)] backdrop-blur-xl md:p-8">
          <div>
            <Link href="/" aria-label="King Sparkon Tracker home" className="inline-flex items-center gap-3">
              <Image
                src="/king-sparkon-logo.png"
                alt="King Sparkon Tracker barcode logo"
                width={56}
                height={56}
                className="rounded-[1.35rem] border border-white/12 bg-white/[0.08] p-1.5"
                priority
              />
              <div>
                <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.2em] text-[var(--gold)]">King Sparkon</p>
                <p className="text-xl font-black uppercase tracking-[-0.04em]">Tracker</p>
              </div>
            </Link>

            <div className="mt-12 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-white/68">
                <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> {eyebrow}
              </div>
              <h1 className="mt-6 text-5xl font-black leading-[0.95] tracking-[-0.07em] md:text-6xl xl:text-7xl">{visualTitle}</h1>
              <p className="mt-6 text-sm leading-7 text-white/65 md:text-base">{visualText}</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="grid gap-3 sm:grid-cols-3">
              {securityMetrics.map(([value, label]) => (
                <div key={value} className="rounded-[1.5rem] border border-white/10 bg-white/[0.055] p-4">
                  <p className="font-mono text-lg font-black text-white">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.12em] text-white/45">{label}</p>
                </div>
              ))}
            </div>
            <div className="barcode-rule mt-7 text-white" />
          </div>
        </aside>

        <section className="relative">
          <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-[var(--gold)]/16 via-white/5 to-[var(--signal)]/16 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2.75rem] border border-white/12 bg-[var(--paper)] p-4 text-[var(--ink)] shadow-[var(--shadow-depth)] md:p-6">
            <div className="absolute right-[-6rem] top-[-8rem] h-72 w-72 rounded-full bg-[var(--gold)]/25 blur-3xl" />
            <div className="absolute bottom-[-8rem] left-[-7rem] h-80 w-80 rounded-full bg-[var(--signal)]/15 blur-3xl" />

            <div className="relative rounded-[2.25rem] border border-[var(--line)] bg-white/78 p-5 shadow-[var(--shadow-ledger)] backdrop-blur md:p-7">
              <div className="flex flex-col gap-4 border-b border-[var(--line)] pb-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">{eyebrow}</p>
                  <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] md:text-4xl">{title}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--steel)]">{description}</p>
                </div>
                <div className="grid h-13 w-13 shrink-0 place-items-center rounded-[1.35rem] bg-[var(--ink)] text-[var(--gold)] shadow-[var(--shadow-soft)]">
                  {isLogin ? <ShieldCheck className="h-6 w-6" /> : <Barcode className="h-6 w-6" />}
                </div>
              </div>

              {activeNote ? (
                <div className="mt-5 flex gap-3 rounded-[1.5rem] border border-[var(--gold)]/35 bg-[var(--gold)]/10 p-4 text-sm font-semibold leading-6 text-[var(--steel)]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
                  <span>{activeNote}</span>
                </div>
              ) : null}

              <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
                <div className={isRegister ? "grid gap-5 md:grid-cols-2" : "grid gap-5"}>
                  {fields.map((field) => (
                    <FieldInput key={field.name} field={field} />
                  ))}
                </div>

                {isLogin ? (
                  <div className="flex flex-col gap-3 text-sm font-bold text-[var(--steel)] sm:flex-row sm:items-center sm:justify-between">
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="remember" className="h-4 w-4 rounded border-[var(--line)] accent-[var(--signal)]" />
                      Remember this device
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <Link href="/resend-verification" className="text-[var(--signal)] hover:text-[var(--ember)]">
                        Resend verification
                      </Link>
                      <Link href="/forgot-password" className="text-[var(--signal)] hover:text-[var(--ember)]">
                        Forgot password?
                      </Link>
                    </div>
                  </div>
                ) : null}

                {isRegister ? (
                  <label className="flex items-start gap-3 rounded-[1.5rem] border border-[var(--line)] bg-[var(--paper)] p-4 text-sm font-semibold leading-6 text-[var(--steel)]">
                    <input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-[var(--signal)]" />
                    <span>I confirm this account will manage a business-scoped King Sparkon Tracker workspace.</span>
                  </label>
                ) : null}

                {status ? (
                  <div
                    aria-live="polite"
                    className={`flex gap-3 rounded-[1.5rem] border px-4 py-3 text-sm font-semibold leading-6 ${
                      status.tone === "error" ? "border-[var(--signal)] bg-[var(--signal)]/10 text-[var(--ember)]" : "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]"
                    }`}
                  >
                    {status.tone === "error" ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
                    <span>{status.message}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex min-h-13 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ember)] disabled:pointer-events-none disabled:opacity-60"
                >
                  {isSubmitting ? "Working..." : submitLabel} <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 rounded-[1.75rem] border border-[var(--line)] bg-[var(--paper)] p-4">
                <p className="text-sm font-bold text-[var(--steel)]">
                  {footerText} {" "}
                  <Link href={footerHref} className="font-black text-[var(--signal)] hover:text-[var(--ember)]">
                    {footerLink}
                  </Link>
                </p>
              </div>

              <div className="mt-6 border-t border-[var(--line)] pt-6">
                <p className="mb-3 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">Official profiles</p>
                <SocialLinks variant="light" />
              </div>
            </div>

            <div className="relative mt-4 grid gap-3 md:grid-cols-2">
              {authTrustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--line)] bg-white/72 px-4 py-3 text-sm font-bold text-[var(--steel)] shadow-[var(--shadow-soft)]">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--confirm)]" />
                  {point}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 text-xs font-bold text-white/45">
            <span className="inline-flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-[var(--gold)]" /> Social links point to profiles, not repositories.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
