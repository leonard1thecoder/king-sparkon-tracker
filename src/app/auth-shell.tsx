"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type AuthField = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
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

type AuthStatus = { tone: "success" | "error" | "info"; message: string };

function fieldValue(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function payloadFromForm(formData: FormData) {
  const payload: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    if (key === "terms" || typeof value !== "string") {
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
  return (
    <label className="grid gap-2" htmlFor={field.name}>
      <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--steel)]">{field.label}</span>
      {field.options ? (
        <select id={field.name} name={field.name} defaultValue={field.defaultValue ?? field.options[0]?.value} required className="border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--ink)]">
          {field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea id={field.name} name={field.name} placeholder={field.placeholder} defaultValue={field.defaultValue} className="min-h-28 border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--ink)]" />
      ) : (
        <input id={field.name} name={field.name} type={field.type} autoComplete={field.autoComplete} placeholder={field.placeholder} defaultValue={field.defaultValue} required className="border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--ink)]" />
      )}
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
  const activeNote = useMemo(() => note ?? (mode === "register" ? "Owners, affiliates, and admins must verify email before login when the backend requires it." : null), [mode, note]);

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

      if (mode !== "login") {
        form.reset();
      }

      setStatus({ tone: "success", message: successMessage(mode, responseBody) });

      if (mode === "login") {
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
    <main className="grid min-h-screen bg-[var(--paper)] text-[var(--ink)] lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex items-center justify-center p-5 md:p-10">
        <div className="w-full max-w-xl border border-[var(--line)] bg-white/55 p-6 shadow-[var(--shadow-ledger)] md:p-8">
          <Image src="/king-sparkon-logo.png" alt="King Sparkon Tracker logo" width={96} height={96} className="mb-7 rounded-full border border-[var(--line)]" priority />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.18em] text-[var(--signal)]">{eyebrow}</p>
          <h1 className="mt-3 font-mono text-3xl font-black uppercase tracking-[-0.04em] md:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--steel)]">{description}</p>
          {activeNote ? <div className="mt-5 border border-[var(--line)] bg-[var(--paper)] px-4 py-3 text-sm leading-6 text-[var(--steel)]">{activeNote}</div> : null}

          <form className="mt-7 grid gap-5" onSubmit={handleSubmit}>
            {fields.map((field) => <FieldInput key={field.name} field={field} />)}
            {mode === "login" ? (
              <div className="flex justify-between gap-3 text-sm font-semibold text-[var(--steel)]">
                <Link href="/resend-verification" className="hover:text-[var(--signal)]">Resend verification</Link>
                <Link href="/forgot-password" className="hover:text-[var(--signal)]">Forgot password?</Link>
              </div>
            ) : null}
            {mode === "register" ? (
              <label className="flex items-start gap-3 text-sm leading-6 text-[var(--steel)]">
                <input type="checkbox" name="terms" required className="mt-1 h-4 w-4 accent-[var(--signal)]" />
                <span>I confirm this account will manage a business-scoped workspace.</span>
              </label>
            ) : null}
            {status ? <div className={`border px-4 py-3 text-sm leading-6 ${status.tone === "error" ? "border-[var(--signal)] text-[var(--signal)]" : "border-[var(--confirm)] text-[var(--confirm)]"}`}>{status.message}</div> : null}
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Working..." : submitLabel}</Button>
          </form>
          <p className="mt-6 text-sm text-[var(--steel)]">{footerText} <Link href={footerHref} className="font-bold text-[var(--signal)]">{footerLink}</Link></p>
        </div>
      </section>
      <aside className="hidden bg-[var(--ink)] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="barcode-rule mb-8 text-white" />
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--signal)]">Secure scan identity</p>
          <h2 className="mt-4 font-mono text-5xl font-black uppercase tracking-[-0.05em]">{visualTitle}</h2>
          <p className="mt-5 max-w-lg text-sm leading-7 text-white/65">{visualText}</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[["HTTPONLY", "Session"], ["ROLE", "Guard"], ["RATE", "Cooldown"]].map(([value, label]) => (
            <div key={value} className="border border-white/15 p-4">
              <p className="font-mono text-lg font-black">{value}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.12em] text-white/50">{label}</p>
            </div>
          ))}
        </div>
      </aside>
    </main>
  );
}
