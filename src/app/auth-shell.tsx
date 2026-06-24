"use client";

import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Building2,
  CheckCircle2,
  Globe2,
  KeyRound,
  LockKeyhole,
  Mail,
  ShieldCheck,
  type LucideIcon,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { normalizeUserRole } from "@/lib/roles";

type AuthIconName = "business" | "email" | "lock" | "user" | "key" | "country";

type AuthField = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  icon: AuthIconName;
  defaultValue?: string;
  options?: Array<{ label: string; value: string }>;
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

type AuthStatus = {
  tone: "success" | "error" | "info";
  message: string;
};

type SocialIconName = "facebook" | "instagram" | "x" | "github";

type BackendError = {
  message?: string;
  error?: string;
  detail?: string;
};

const iconMap: Record<AuthIconName, LucideIcon> = {
  business: Building2,
  country: Globe2,
  email: Mail,
  lock: LockKeyhole,
  user: UserRound,
  key: KeyRound,
};

const highlights = [
  { label: "Business scoped", value: "100%", accent: "bg-[#99e39e]" },
  { label: "Core flows", value: "8", accent: "bg-[#1dc8cd]" },
  { label: "Secure session", value: "JWT", accent: "bg-[#ffab00]" },
];

const auditItems = [
  "httpOnly session cookie",
  "Role-aware dashboard routing",
  "Business-scoped backend calls",
];

const socialLinks: Array<{ label: string; href: string; icon: SocialIconName }> = [
  { label: "Facebook", href: "https://www.facebook.com", icon: "facebook" },
  { label: "Instagram", href: "https://www.instagram.com", icon: "instagram" },
  { label: "X", href: "https://x.com", icon: "x" },
  { label: "GitHub", href: "https://github.com/leonard1thecoder/king-sparkon-tracker", icon: "github" },
];

function BrandMark() {
  return (
    <Image
      src="/king-sparkon-logo.png"
      alt="King Sparkon Tracker logo"
      width={220}
      height={220}
      priority
      className="h-auto w-[112px] rounded-full sm:w-[132px]"
    />
  );
}

function SocialIcon({ name }: { name: SocialIconName }) {
  if (name === "facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M14.25 8.25V6.6c0-.72.48-.9.82-.9h2.12V2.1L14.27 2C11.03 2 10.3 4.42 10.3 5.97v2.28H7.75V12h2.55v10h4.05V12h2.72l.36-3.75h-3.18Z" />
      </svg>
    );
  }

  if (name === "instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
        <rect x="3.5" y="3.5" width="17" height="17" rx="4.8" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="3.7" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="17.1" cy="6.9" r="1.2" fill="currentColor" />
      </svg>
    );
  }

  if (name === "github") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.25c-5.52 0-10 4.36-10 9.74 0 4.31 2.87 7.96 6.85 9.25.5.09.68-.21.68-.47 0-.23-.01-.84-.01-1.65-2.79.59-3.38-1.31-3.38-1.31-.45-1.13-1.11-1.43-1.11-1.43-.91-.61.07-.6.07-.6 1 .07 1.53 1 1.53 1 .89 1.49 2.34 1.06 2.91.81.09-.63.35-1.06.63-1.3-2.23-.25-4.57-1.09-4.57-4.83 0-1.07.39-1.94 1.03-2.62-.1-.25-.45-1.25.1-2.59 0 0 .84-.26 2.75 1a9.8 9.8 0 0 1 5.02 0c1.91-1.26 2.75-1 2.75-1 .55 1.34.2 2.34.1 2.59.64.68 1.03 1.55 1.03 2.62 0 3.75-2.35 4.58-4.59 4.82.36.31.68.91.68 1.84 0 1.33-.01 2.4-.01 2.73 0 .26.18.56.69.47A9.82 9.82 0 0 0 22 11.99c0-5.38-4.48-9.74-10-9.74Z"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path d="M4.5 4.5 19.5 19.5M19.5 4.5 4.5 19.5" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

function SocialLinks() {
  return (
    <div className="mt-5 flex items-center justify-center gap-3" aria-label="King Sparkon Tracker social links">
      {socialLinks.map((link) => (
        <a
          key={link.label}
          href={link.href}
          target="_blank"
          rel="noreferrer"
          aria-label={link.label}
          title={link.label}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/80 shadow-sm transition hover:border-[#99e39e] hover:bg-[#99e39e]/10 hover:text-[#99e39e] focus:outline-none focus:ring-4 focus:ring-[#99e39e]/20"
        >
          <SocialIcon name={link.icon} />
        </a>
      ))}
    </div>
  );
}

function FieldInput({ field }: { field: AuthField }) {
  const Icon = iconMap[field.icon];

  return (
    <label className="block" htmlFor={field.name}>
      <span className="text-sm font-medium text-white/76">{field.label}</span>
      <span className="mt-2 flex min-h-12 w-full min-w-0 items-center gap-3 rounded-lg border border-white/12 bg-[#000510]/55 px-3 shadow-sm shadow-black/20 transition hover:border-[#99e39e]/45 hover:bg-[#000510]/70 focus-within:border-[#99e39e] focus-within:bg-[#000510]/70 focus-within:ring-4 focus-within:ring-[#99e39e]/15">
        <Icon className="h-5 w-5 shrink-0 text-[#99e39e]" aria-hidden="true" />
        {field.options ? (
          <select
            id={field.name}
            name={field.name}
            defaultValue={field.defaultValue ?? field.options[0]?.value}
            required
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none hover:text-white focus:text-white"
          >
            {field.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={field.name}
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            required
            className="h-11 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/34 hover:text-white focus:text-white"
          />
        )}
      </span>
    </label>
  );
}

function statusClasses(tone: AuthStatus["tone"]) {
  if (tone === "success") {
    return "border-[#99e39e]/30 bg-[#99e39e]/10 text-[#c8fad6]";
  }

  if (tone === "error") {
    return "border-[#ff5630]/30 bg-[#ff5630]/10 text-[#ffac82]";
  }

  return "border-[#ffab00]/30 bg-[#ffab00]/10 text-[#ffd666]";
}

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function dashboardPathForLogin(responseBody: Record<string, unknown>) {
  const user = responseBody.user as { privilege?: unknown } | undefined;
  const role = normalizeUserRole(user?.privilege);

  if (role === "Worker") {
    return "/dashboard/worker";
  }

  if (role === "Owner") {
    return "/dashboard/owner";
  }

  return "/dashboard";
}

function authPayload(mode: AuthMode, formData: FormData): Record<string, string> {
  if (mode === "login") {
    return {
      username: fieldValue(formData, "username"),
      password: fieldValue(formData, "password"),
    };
  }

  if (mode === "register") {
    return {
      username: fieldValue(formData, "username"),
      emailAddress: fieldValue(formData, "emailAddress"),
      password: fieldValue(formData, "password"),
      businessName: fieldValue(formData, "businessName"),
      localizationCountry: fieldValue(formData, "localizationCountry"),
    };
  }

  if (mode === "forgot" || mode === "resend") {
    return {
      emailAddress: fieldValue(formData, "emailAddress"),
    };
  }

  return {
    token: fieldValue(formData, "token"),
    newPassword: fieldValue(formData, "newPassword"),
    confirmPassword: fieldValue(formData, "confirmPassword"),
  };
}

function validateAuthPayload(mode: AuthMode, payload: Record<string, string>) {
  if (Object.values(payload).some((value) => !value)) {
    return "Complete every required field before submitting.";
  }

  if ("emailAddress" in payload && !payload.emailAddress.includes("@")) {
    return "Enter a valid email address. Gmail, Outlook, and personal emails are allowed.";
  }

  if (mode === "reset") {
    if (payload.newPassword.length < 8) {
      return "New password must be at least 8 characters.";
    }

    if (payload.newPassword !== payload.confirmPassword) {
      return "New password and confirmation must match.";
    }
  }

  return null;
}

function authSuccessMessage(mode: AuthMode, responseBody: Record<string, unknown>) {
  if (mode === "login") {
    const user = responseBody.user as { username?: string } | undefined;
    return user?.username
      ? `Signed in as ${user.username}. Secure session cookie created.`
      : "Signed in successfully. Secure session cookie created.";
  }

  if (mode === "register") {
    return "Owner account created. Check the email inbox for verification, then sign in.";
  }

  if (mode === "forgot") {
    return "If the email exists, a reset link has been sent.";
  }

  if (mode === "resend") {
    return "If the account needs verification, a new verification link has been sent.";
  }

  return "Password reset successful. You can now sign in with the new password.";
}

function InsightPanel({
  visualTitle,
  visualText,
}: Pick<AuthShellProps, "visualTitle" | "visualText">) {
  return (
    <aside className="relative hidden min-h-screen overflow-hidden bg-[#000510] px-10 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-14">
      <div className="absolute -right-40 -top-28 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-[#477e70] to-[#666c78] opacity-45 blur-[220px]" />
      <div className="absolute -bottom-48 -left-48 h-[34rem] w-[34rem] rounded-full bg-gradient-to-br from-[#99e39e] to-[#1dc8cd] opacity-20 blur-[220px]" />
      <div className="crypto-grid absolute inset-0 opacity-[0.1]" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#99e39e]/16 text-[#99e39e] shadow-lg shadow-black/20">
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-sm font-medium text-white/85">Barcode inventory SaaS</span>
        </div>
        <span className="rounded-full border border-[#99e39e]/25 bg-[#99e39e]/10 px-3 py-1 text-xs text-[#99e39e]">
          Live API
        </span>
      </div>

      <div className="relative my-16 max-w-xl">
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#99e39e]/25 bg-white/[0.04] px-3 py-1 text-sm text-[#d8dbdb]">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
          Secure product tracking workspace
        </p>
        <h2 className="text-4xl font-semibold leading-tight text-white">{visualTitle}</h2>
        <p className="mt-5 max-w-md text-base leading-7 text-[#d8dbdb]/68">{visualText}</p>
      </div>

      <div className="relative grid gap-4">
        <div className="grid grid-cols-3 gap-3">
          {highlights.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-white/10 bg-white/[0.045] p-4 shadow-xl shadow-black/10 backdrop-blur"
            >
              <span className={`mb-5 block h-1.5 w-10 rounded-sm ${item.accent}`} />
              <p className="text-2xl font-semibold">{item.value}</p>
              <p className="mt-1 text-xs leading-5 text-white/65">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#1e2229]/72 p-5 text-white shadow-2xl shadow-black/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Security snapshot</p>
              <p className="mt-1 text-xs text-white/48">Ready for business-scoped work</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#99e39e]/14 text-[#99e39e]">
              <BarChart3 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {auditItems.map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-[#99e39e]" aria-hidden="true" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
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

  const activeNote = useMemo(() => {
    if (note) {
      return note;
    }

    if (mode === "register") {
      return "Owner email can be Gmail, Outlook, or any valid address. No company-domain restriction is applied.";
    }

    return null;
  }, [mode, note]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus(null);

    try {
      const form = event.currentTarget;
      const payload = authPayload(mode, new FormData(form));
      const validationError = validateAuthPayload(mode, payload);

      if (validationError) {
        setStatus({ tone: "error", message: validationError });
        return;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const responseBody = (await response.json().catch(() => ({}))) as Record<string, unknown> & BackendError;

      if (!response.ok) {
        setStatus({
          tone: "error",
          message: responseBody.message ?? responseBody.error ?? responseBody.detail ?? "The backend rejected this request.",
        });
        return;
      }

      if (mode !== "login") {
        form.reset();
      }

      setStatus({
        tone: "success",
        message: authSuccessMessage(mode, responseBody),
      });

      if (mode === "login") {
        window.setTimeout(() => {
          window.location.href = dashboardPathForLogin(responseBody);
        }, 500);
      }

      if (mode === "reset") {
        window.setTimeout(() => {
          window.location.href = "/login";
        }, 900);
      }
    } catch {
      setStatus({
        tone: "error",
        message: "Unable to reach the auth API. Check that the Next app and backend are running.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="ks-auth relative grid min-h-screen grid-cols-[minmax(0,1fr)] overflow-x-hidden bg-[#000510] text-white lg:grid-cols-[minmax(0,0.95fr)_minmax(480px,1.05fr)]">
      <div className="absolute inset-0 lg:hidden">
        <div className="crypto-grid absolute inset-0 opacity-[0.08]" />
        <div className="absolute -right-48 -top-36 h-[32rem] w-[32rem] rounded-full bg-gradient-to-br from-[#477e70] to-[#666c78] opacity-40 blur-[220px]" />
      </div>
      <section className="flex min-h-screen min-w-0 items-center justify-center px-5 py-8 sm:px-6 lg:px-10">
        <div className="relative w-[calc(100vw-2.5rem)] min-w-0 max-w-md sm:w-full">
          <div className="w-full min-w-0 rounded-3xl border border-white/10 bg-[#1e2229]/70 p-6 shadow-[0_28px_90px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8">
            <div className="mb-8 flex justify-center">
              <BrandMark />
            </div>
            <p className="text-sm font-medium text-[#99e39e]">{eyebrow}</p>
            <h1 className="mt-3 break-words text-3xl font-semibold leading-tight text-white">
              {title}
            </h1>
            <p className="mt-3 break-words text-sm leading-6 text-[#d8dbdb]/62">{description}</p>

            {mode === "login" || mode === "register" ? <SocialLinks /> : null}

            {activeNote ? (
              <div className="mt-5 rounded-xl border border-[#ffab00]/25 bg-[#ffab00]/10 px-4 py-3 text-sm leading-6 text-[#ffd666]">
                {activeNote}
              </div>
            ) : null}

            <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
              {fields.map((field) => (
                <FieldInput key={field.name} field={field} />
              ))}

              {mode === "login" ? (
                <div className="flex flex-col gap-3 text-sm text-[#d8dbdb]/58 sm:flex-row sm:items-center sm:justify-between">
                  <Link className="font-semibold text-[#99e39e] hover:text-white" href="/resend-verification">
                    Resend verification
                  </Link>
                  <Link className="font-semibold text-[#99e39e] hover:text-white" href="/forgot-password">
                    Forgot password?
                  </Link>
                </div>
              ) : null}

              {mode === "register" ? (
                <label className="flex items-start gap-3 text-sm leading-6 text-[#d8dbdb]/60">
                  <input
                    type="checkbox"
                    name="terms"
                    required
                    className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent accent-[#99e39e]"
                  />
                  <span>I confirm this owner account will manage a business-scoped workspace.</span>
                </label>
              ) : null}

              {status ? (
                <div
                  className={`rounded-xl border px-4 py-3 text-sm leading-6 ${statusClasses(status.tone)}`}
                  role={status.tone === "error" ? "alert" : "status"}
                >
                  {status.message}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="mt-1 h-12 w-full bg-[#99e39e] text-[#000510] shadow-[0_18px_42px_rgba(153,227,158,0.22)] hover:bg-transparent hover:text-[#99e39e] hover:ring-1 hover:ring-[#99e39e] focus:outline-none focus:ring-4 focus:ring-[#99e39e]/20"
              >
                <span className="truncate">{isSubmitting ? "Working..." : submitLabel}</span>
                <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-[#d8dbdb]/58">
            {footerText}{" "}
            <Link className="font-semibold text-[#99e39e] hover:text-white" href={footerHref}>
              {footerLink}
            </Link>
          </p>
        </div>
      </section>

      <InsightPanel visualTitle={visualTitle} visualText={visualText} />
    </main>
  );
}
