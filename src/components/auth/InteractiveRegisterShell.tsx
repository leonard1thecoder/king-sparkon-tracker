"use client";

import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Gift,
  KeyRound,
  LockKeyhole,
  Mail,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
} from "lucide-react";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type RegisterField = {
  name: string;
  label: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  defaultValue?: string;
  options?: Array<{ label: string; value: string }>;
  helper?: string;
  required?: boolean;
  readOnly?: boolean;
  visibleForPrivileges?: string[];
  section?: "address" | "referral";
};

type Props = {
  endpoint: string;
  title: string;
  description: string;
  note?: string;
  roleNotes?: Record<string, string>;
  initialRoleNote?: string;
  fields: RegisterField[];
  allowedEmailAddress?: string;
  extraPayload?: Record<string, string>;
};

const roleCopy: Record<string, { title: string; copy: string; tags: string[] }> = {
  USER: {
    title: "Free user",
    copy: "Tickets, jobs, cart checkout, profile and required delivery address.",
    tags: ["R0", "Tickets", "Cart"],
  },
  BUSINESS_OWNER: {
    title: "Business owner",
    copy: "Business setup with required operating address and optional referral promo code.",
    tags: ["Business", "Workers", "Reports"],
  },
  AFFILIATE: {
    title: "Free affiliate",
    copy: "Referral workspace with required physical address and PayPal link for earnings setup.",
    tags: ["R0", "QR", "PayPal"],
  },
  ADMIN: {
    title: "Admin",
    copy: "Restricted platform account for King Sparkon control.",
    tags: ["Locked", "Audit", "Admin"],
  },
};

const iconClass = "h-4 w-4 shrink-0 text-[var(--signal)]";
const fullWidthAddressFields = new Set(["addressStreet", "addressLine2", "addressCountry"]);

function iconFor(field: RegisterField) {
  const normalizedName = field.name.toLowerCase();
  if (normalizedName.includes("password")) return <LockKeyhole className={iconClass} />;
  if (normalizedName.includes("email")) return <Mail className={iconClass} />;
  if (normalizedName.includes("paypal")) return <WalletCards className={iconClass} />;
  if (
    normalizedName.includes("address") ||
    normalizedName.includes("city") ||
    normalizedName.includes("province") ||
    normalizedName.includes("postal")
  ) {
    return <MapPin className={iconClass} />;
  }
  if (normalizedName.includes("affiliate")) return <Gift className={iconClass} />;
  if (normalizedName.includes("service")) return <KeyRound className={iconClass} />;
  return <UserRound className={iconClass} />;
}

function Field({ field, onRoleChange }: { field: RegisterField; onRoleChange?: (value: string) => void }) {
  const [showPassword, setShowPassword] = useState(false);

  if (field.type === "hidden") {
    return <input type="hidden" name={field.name} value={field.defaultValue ?? ""} />;
  }

  const required = field.required !== false;
  const showPayPalHelp = field.name.toLowerCase().includes("paypal");
  const isPassword = field.type === "password";
  const inputType = isPassword && showPassword ? "text" : field.type;
  const helperId = field.helper ? `${field.name}-helper` : undefined;
  const spansAddressGrid = field.section === "address" && fullWidthAddressFields.has(field.name);

  return (
    <div
      className={`grid min-w-0 gap-2 ${
        spansAddressGrid ? "md:col-span-2 lg:col-span-1 xl:col-span-2" : ""
      }`}
    >
      <span className="flex min-w-0 flex-wrap items-center justify-between gap-2">
        <label htmlFor={field.name} className="min-w-0 text-sm font-black text-[var(--ink)]">
          {field.label}
        </label>
        {!required ? (
          <span className="shrink-0 rounded-full bg-[var(--surface)] px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--muted)]">
            Optional
          </span>
        ) : null}
      </span>

      <span className="flex min-h-12 min-w-0 items-center gap-3 overflow-hidden rounded-[1.35rem] border border-[var(--line)] bg-white px-4 shadow-[var(--shadow-soft)] transition focus-within:border-[var(--gold)] focus-within:shadow-[var(--focus-ring)]">
        {iconFor(field)}
        {field.options ? (
          <select
            id={field.name}
            name={field.name}
            defaultValue={field.defaultValue ?? field.options[0]?.value}
            required={required}
            aria-describedby={helperId}
            onChange={(event) => onRoleChange?.(event.target.value)}
            className="min-h-12 min-w-0 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none"
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
            type={inputType}
            autoComplete={field.autoComplete}
            placeholder={field.placeholder}
            defaultValue={field.defaultValue}
            required={required}
            readOnly={field.readOnly}
            aria-describedby={helperId}
            className="min-h-12 min-w-0 w-full bg-transparent text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] read-only:text-[var(--steel)]"
          />
        )}
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[var(--muted)] transition hover:bg-[var(--surface)] hover:text-[var(--signal)]"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </span>

      {field.helper ? (
        <span id={helperId} className="min-w-0 break-words text-xs font-semibold leading-5 text-[var(--steel)]">
          {field.helper}
        </span>
      ) : null}

      {showPayPalHelp ? (
        <a
          href="https://www.paypal.com/paypalme"
          target="_blank"
          rel="noreferrer"
          className="min-w-0 break-words text-xs font-black text-[var(--signal)] underline decoration-[var(--gold)] decoration-2 underline-offset-4 hover:text-[var(--ember)]"
        >
          Don&apos;t know PayPal? Create or find your PayPal.me link
        </a>
      ) : null}
    </div>
  );
}

function ToggleSection({
  title,
  copy,
  required,
  open,
  onClick,
  children,
  id,
}: {
  title: string;
  copy: string;
  required?: boolean;
  open: boolean;
  onClick: () => void;
  children: ReactNode;
  id: string;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[1.65rem] border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow-soft)]">
      <button
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-controls={id}
        className="flex w-full min-w-0 items-center justify-between gap-4 p-4 text-left transition hover:bg-white/60 md:p-5"
      >
        <span className="min-w-0">
          <span className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="text-base font-black text-[var(--ink)]">{title}</span>
            <span
              className={
                required
                  ? "rounded-full bg-[var(--gold)] px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--ink)]"
                  : "rounded-full bg-white px-2 py-1 text-[0.65rem] font-black uppercase tracking-[0.12em] text-[var(--steel)]"
              }
            >
              {required ? "Required" : "Optional"}
            </span>
          </span>
          <span className="mt-1 block min-w-0 break-words text-sm font-semibold leading-6 text-[var(--steel)]">
            {copy}
          </span>
        </span>
        <span
          className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--line)] bg-white text-[var(--signal)] transition ${
            open ? "rotate-180" : ""
          }`}
        >
          <ArrowDown className="h-4 w-4" />
        </span>
      </button>

      {open ? (
        <div
          id={id}
          className="grid min-w-0 gap-5 border-t border-[var(--line)] bg-white/70 p-4 md:grid-cols-2 md:p-5 lg:grid-cols-1 xl:grid-cols-2"
        >
          {children}
        </div>
      ) : null}
    </section>
  );
}

function buildPayload(formData: FormData) {
  const payload: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "terms" || typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) payload[key] = trimmed;
  }

  const parts = [
    payload.addressStreet,
    payload.addressLine2,
    payload.addressSuburb,
    payload.addressCity,
    payload.addressProvince,
    payload.addressPostalCode,
    payload.addressCountry,
  ].filter(Boolean);

  if (parts.length) payload.physicalAddress = parts.join(", ");
  if (payload.serviceRegisteringFor === "USER") payload.serviceRegistrationType = "FREE_USER_ACCESS";
  if (payload.serviceRegisteringFor === "AFFILIATE") payload.serviceRegistrationType = "FREE_AFFILIATE_ACCESS";
  if (
    payload.serviceRegisteringFor === "BUSINESS_OWNER" &&
    (!payload.serviceRegistrationType ||
      payload.serviceRegistrationType === "FREE_USER_ACCESS" ||
      payload.serviceRegistrationType === "FREE_AFFILIATE_ACCESS")
  ) {
    payload.serviceRegistrationType = "FULL_BUSINESS_SUITE";
  }

  return payload;
}

export function InteractiveRegisterShell({
  endpoint,
  title,
  description,
  note,
  roleNotes,
  initialRoleNote,
  fields,
  allowedEmailAddress,
  extraPayload,
}: Props) {
  const initialRole = fields.find((field) => field.name === "serviceRegisteringFor")?.defaultValue ?? "USER";
  const [role, setRole] = useState(initialRole);
  const [addressOpen, setAddressOpen] = useState(true);
  const [referralOpen, setReferralOpen] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const visibleFields = useMemo(
    () =>
      fields.filter(
        (field) =>
          !field.visibleForPrivileges ||
          field.visibleForPrivileges.includes(role) ||
          field.name === "serviceRegisteringFor" ||
          field.name === "serviceRegistrationType" ||
          field.type === "hidden",
      ),
    [fields, role],
  );

  const addressFields = visibleFields.filter((field) => field.section === "address");
  const referralFields = visibleFields.filter((field) => field.section === "referral");
  const mainFields = visibleFields.filter((field) => !field.section);
  const selectedCopy = roleCopy[role];
  const addressRequired = addressFields.length > 0 && addressFields.some((field) => field.required !== false);
  const showReferral = role === "BUSINESS_OWNER" && referralFields.length > 0;
  const activeNote = [roleNotes?.[role] ?? note, role === initialRole ? initialRoleNote : undefined]
    .filter(Boolean)
    .join(" ");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setSubmitting(true);
    setStatus(null);

    try {
      const payload = { ...buildPayload(new FormData(form)), ...(extraPayload ?? {}) };
      if (addressRequired && !addressOpen) {
        throw new Error("Open Physical address and complete the required address fields.");
      }

      const fieldsToCheck = [
        ...mainFields,
        ...(addressOpen ? addressFields : []),
        ...(referralOpen ? referralFields : []),
      ];
      const missing = fieldsToCheck.find(
        (field) => field.type !== "hidden" && field.required !== false && !payload[field.name],
      );

      if (missing) throw new Error(`Complete ${missing.label.toLowerCase()} before submitting.`);
      if (payload.emailAddress && !payload.emailAddress.includes("@")) {
        throw new Error("Enter a valid email address.");
      }
      if (
        allowedEmailAddress &&
        payload.emailAddress?.toLowerCase() !== allowedEmailAddress.toLowerCase()
      ) {
        throw new Error(`Admin registration is restricted to ${allowedEmailAddress}.`);
      }

      await axios.post(endpoint, payload, { withCredentials: true });
      setStatus({
        tone: "success",
        message: "Account created. Check your inbox for verification before signing in.",
      });
      form.reset();
      setRole(initialRole);
      setAddressOpen(true);
      setReferralOpen(false);
    } catch (error) {
      setStatus({
        tone: "error",
        message: axios.isAxiosError(error)
          ? messageFromBackendPayload(error.response?.data)
          : error instanceof Error
            ? error.message
            : "Unable to reach the auth API.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--surface)] text-[var(--ink)]">
      <div className="pointer-events-none absolute inset-0 enterprise-grid opacity-70" />
      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-6 md:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start lg:py-10">
        <section className="min-w-0 lg:sticky lg:top-10">
          <Link
            href="/"
            className="inline-flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/82 px-3 py-2 shadow-[var(--shadow-soft)]"
          >
            <Image
              src="/king-sparkon-logo.png"
              alt="King Sparkon Tracker"
              width={46}
              height={46}
              className="rounded-[1rem] border border-[var(--line)] bg-white p-1"
            />
            <span>
              <span className="block font-mono text-[0.64rem] font-black uppercase tracking-[0.2em] text-[var(--signal)]">
                King Sparkon
              </span>
              <span className="block font-black uppercase tracking-[-0.04em]">Tracker</span>
            </span>
          </Link>

          <div className="mt-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white px-3 py-2 font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--steel)] shadow-[var(--shadow-soft)]">
              <Sparkles className="h-3.5 w-3.5 text-[var(--gold)]" /> Interactive setup
            </div>
            <h1 className="mt-5 text-4xl font-black leading-[0.96] tracking-[-0.06em] md:text-6xl">{title}</h1>
            <p className="mt-5 text-sm leading-7 text-[var(--steel)] md:text-base">{description}</p>
          </div>

          {selectedCopy ? (
            <div className="mt-7 rounded-[1.6rem] border border-[var(--line)] bg-[var(--ink)] p-5 text-white shadow-[var(--shadow-soft)]">
              <p className="font-mono text-[0.66rem] font-black uppercase tracking-[0.16em] text-[var(--gold)]">
                Selected role
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{selectedCopy.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/68">{selectedCopy.copy}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedCopy.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-white/72"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {activeNote ? (
            <div
              key={role}
              aria-live="polite"
              className="mt-5 flex min-w-0 gap-3 rounded-[1.45rem] border border-[var(--gold)]/45 bg-[var(--gold)]/10 p-4 text-sm font-semibold leading-6 text-[var(--steel)]"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--signal)]" />
              <span className="min-w-0 break-words">{activeNote}</span>
            </div>
          ) : null}
        </section>

        <section className="min-w-0 rounded-[2rem] border border-[var(--line)] bg-white/94 p-5 shadow-[var(--shadow-ledger)] backdrop-blur md:p-7">
          <div className="flex min-w-0 items-start justify-between gap-4 border-b border-[var(--line)] pb-5">
            <div className="min-w-0">
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">
                Simple beautiful form
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
                Choose role, then complete what matters.
              </h2>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <form className="mt-6 grid min-w-0 gap-5" onSubmit={handleSubmit}>
            <div className="grid min-w-0 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {mainFields.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  onRoleChange={(value) => {
                    if (field.name === "serviceRegisteringFor") {
                      setRole(value);
                      setAddressOpen(true);
                      setReferralOpen(false);
                      setStatus(null);
                    }
                  }}
                />
              ))}
            </div>

            {addressFields.length ? (
              <ToggleSection
                id="register-address-fields"
                title="Physical address"
                copy="Complete the full address. It is required for User, Business Owner, and Affiliate accounts."
                required={addressRequired}
                open={addressOpen}
                onClick={() => setAddressOpen((open) => !open)}
              >
                {addressFields.map((field) => (
                  <Field key={field.name} field={field} />
                ))}
              </ToggleSection>
            ) : null}

            {showReferral ? (
              <ToggleSection
                id="register-referral-fields"
                title="Who referred you? Promo code"
                copy="Optional. Use this only when an affiliate or promoter referred the business owner registration."
                open={referralOpen}
                onClick={() => setReferralOpen((open) => !open)}
              >
                {referralFields.map((field) => (
                  <Field key={field.name} field={field} />
                ))}
              </ToggleSection>
            ) : null}

            <label className="flex min-w-0 items-start gap-3 rounded-[1.35rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-semibold leading-6 text-[var(--steel)]">
              <input type="checkbox" name="terms" required className="mt-1 h-4 w-4 shrink-0 accent-[var(--signal)]" />
              <span className="min-w-0 break-words">
                I confirm this account is being created for the selected King Sparkon role and service.
              </span>
            </label>

            {status ? (
              <div
                aria-live="polite"
                role={status.tone === "error" ? "alert" : "status"}
                className={`flex min-w-0 gap-3 rounded-[1.35rem] border px-4 py-3 text-sm font-semibold leading-6 ${
                  status.tone === "error"
                    ? "border-[var(--danger)] bg-[var(--danger)]/10 text-[var(--danger)]"
                    : "border-[var(--confirm)] bg-[var(--confirm)]/10 text-[var(--confirm)]"
                }`}
              >
                {status.tone === "error" ? (
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                )}
                <span className="min-w-0 break-words">{status.message}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 py-2 text-sm font-black text-white shadow-[0_12px_28px_rgba(29,92,131,0.18)] transition duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-[var(--ink)] disabled:opacity-55 sm:w-auto sm:justify-self-start"
            >
              {submitting ? "Submitting..." : "Create account"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-6 rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] p-4 text-sm font-bold text-[var(--steel)]">
            Already have an account?{" "}
            <Link href="/login" className="font-black text-[var(--signal)] hover:text-[var(--ember)]">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
