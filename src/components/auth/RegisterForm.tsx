"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { PasswordField, SelectField, StatusNote, TextField, primaryButtonClass, type SelectOption } from "@/components/auth/AuthFields";
import { REGISTER_ROLES, buildRegisterPayload, type RegisterRole } from "@/lib/auth/register-payload";
import { registrationPrivilegeOptions } from "@/lib/auth/registration";
import { messageFromBackendPayload } from "@/lib/utils/errors";

// Role copy and tags are the wording from the original register form.
const roleCopy: Record<RegisterRole, { copy: string; tags: string[] }> = {
  USER: {
    copy: "Tickets, jobs, cart checkout and profile — gender required, no physical address or reference code.",
    tags: ["R0", "Tickets", "Cart"],
  },
  BUSINESS_OWNER: {
    copy: "Business setup with required operating address and optional referral promo code.",
    tags: ["Business", "Workers", "Reports"],
  },
  AFFILIATE: {
    copy: "Referral workspace with required physical address and PayPal link for earnings setup.",
    tags: ["R0", "QR", "PayPal"],
  },
  ARTIST: {
    copy: "Artist workspace with booking fee, performance schedule and type — DJ, Musician or MCEE.",
    tags: ["Bookings", "Per Day", "Fee"],
  },
};

const genderOptions: SelectOption[] = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
  { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
];

const artistOptions: SelectOption[] = [
  { label: "DJ", value: "DJ" },
  { label: "Musician", value: "MUSICIAN" },
  { label: "MCEE", value: "MCEE" },
];

const localizationOptions: SelectOption[] = [
  { label: "South Africa", value: "SOUTH_AFRICA" },
  { label: "Rest of the world", value: "REST_OF_WORLD" },
];

const ADDRESS_ROLES: RegisterRole[] = ["BUSINESS_OWNER", "AFFILIATE", "ARTIST"];
const CONTACT_ROLES: RegisterRole[] = ["USER", "BUSINESS_OWNER", "AFFILIATE", "ARTIST"];

type Status = { tone: "error" | "success"; message: string } | null;

function isRegisterRole(value: string): value is RegisterRole {
  return (REGISTER_ROLES as readonly string[]).includes(value);
}

// Required fields for a role, in the order they are checked. Names match the backend contract.
function requiredFieldsFor(role: RegisterRole) {
  const fields: Array<{ name: string; label: string }> = [{ name: "username", label: "Username" }, { name: "emailAddress", label: "Email address" }];
  if (CONTACT_ROLES.includes(role)) fields.push({ name: "cellphoneNumber", label: "Cellphone number" });
  if (role === "USER") fields.push({ name: "gender", label: "Gender" });
  if (role === "BUSINESS_OWNER") fields.push({ name: "businessName", label: "Business name" });
  if (role === "AFFILIATE") fields.push({ name: "paypalLink", label: "Affiliate PayPal link" });
  if (role === "ARTIST") {
    fields.push({ name: "artistType", label: "Artist type" }, { name: "performancesPerDay", label: "Performances per day" }, { name: "minimumBookingFee", label: "Minimum booking fee" });
  }
  fields.push({ name: "password", label: "Create password" });
  if (ADDRESS_ROLES.includes(role)) {
    fields.push(
      { name: "addressStreet", label: "Street address" },
      { name: "addressSuburb", label: "Suburb or township" },
      { name: "addressCity", label: "City" },
      { name: "addressProvince", label: "Province" },
      { name: "addressPostalCode", label: "Postal code" },
    );
  }
  return fields;
}

export function RegisterForm({ initialRole }: { initialRole: string }) {
  const startRole: RegisterRole = isRegisterRole(initialRole) ? initialRole : "USER";
  const [role, setRole] = useState<RegisterRole>(startRole);
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  const showAddress = ADDRESS_ROLES.includes(role);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!formData.get("terms")) {
      setStatus({ tone: "error", message: "Confirm the account details before creating it." });
      return;
    }

    const payload = buildRegisterPayload(formData);
    const missing = requiredFieldsFor(role).find((field) => !payload[field.name]);
    if (missing) {
      setStatus({ tone: "error", message: `Complete ${missing.label.toLowerCase()} before submitting.` });
      return;
    }
    if (payload.emailAddress && !payload.emailAddress.includes("@")) {
      setStatus({ tone: "error", message: "Enter a valid email address." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      // Same endpoint and body contract as the original register form.
      await axios.post("/api/auth/register", payload, { withCredentials: true });
      setStatus({ tone: "success", message: "Account created. Check your inbox for verification before signing in." });
      form.reset();
      setRole(startRole);
    } catch (error) {
      setStatus({
        tone: "error",
        message: axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to reach the auth API.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-8">
      <h1 className="text-[1.875rem] font-extrabold leading-tight tracking-tight text-[var(--ks-ink)]">Create your account</h1>

      <fieldset className="grid gap-3">
        <legend className="mb-3 text-sm font-semibold text-[var(--ks-ink)]">Choose role</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {registrationPrivilegeOptions.map((option) => {
            const value = option.value as RegisterRole;
            const selected = role === value;
            const copy = roleCopy[value];
            return (
              <label
                key={option.value}
                className={`relative grid cursor-pointer gap-3 rounded-[18px] border p-4 transition-colors duration-150 focus-within:ring-4 focus-within:ring-[rgba(118,200,147,0.35)] ${
                  selected
                    ? "border-[var(--ks-ink)] bg-[var(--ks-light-green)]/40"
                    : "border-[#cfd9d2] ks-surface hover:border-[var(--ks-green)]"
                }`}
              >
                <input
                  type="radio"
                  name="serviceRegisteringFor"
                  value={option.value}
                  checked={selected}
                  onChange={() => setRole(value)}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-3">
                  <span className="text-base font-bold text-[var(--ks-ink)]">{option.label}</span>
                  {selected ? <span className="rounded-full bg-[var(--ks-ink)] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-white">Selected</span> : null}
                </span>
                <span className="text-sm leading-6 text-[var(--ks-muted)]">{copy.copy}</span>
                <span className="flex flex-wrap gap-1.5">
                  {copy.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-[#cfd9d2] bg-white px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-[0.1em] text-[var(--ks-ink)]">
                      {tag}
                    </span>
                  ))}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        {role === "BUSINESS_OWNER" ? <div className="sm:col-span-2"><TextField name="businessName" label="Business name" autoComplete="organization" placeholder="Sparkon Retail Store" /></div> : null}
        <div className="sm:col-span-2 sm:max-w-none">
          <TextField name="username" label="Username" autoComplete="username" placeholder="Choose a username" />
        </div>
        <TextField name="emailAddress" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" />
        {CONTACT_ROLES.includes(role) ? <TextField name="cellphoneNumber" label="Cellphone number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+27 82 123 4567" /> : null}
        {role === "USER" ? <SelectField name="gender" label="Gender" options={genderOptions} defaultValue="MALE" /> : null}
        {role === "ARTIST" ? (
          <>
            <SelectField name="artistType" label="Artist type" options={artistOptions} />
            <TextField name="performancesPerDay" label="Performances per day" type="number" inputMode="numeric" min={1} placeholder="2" />
            <TextField name="minimumBookingFee" label="Minimum booking fee" placeholder="500" />
          </>
        ) : null}
        {role === "BUSINESS_OWNER" ? <TextField name="businessPaypalLink" label="Business PayPal payment link" type="url" required={false} placeholder="https://paypal.me/yourname" /> : null}
        {role === "AFFILIATE" ? <TextField name="paypalLink" label="Affiliate PayPal link" type="url" placeholder="https://paypal.me/yourname" /> : null}
        <PasswordField name="password" label="Create password" autoComplete="new-password" placeholder="Create a password" />
        <SelectField name="localizationCountry" label="Localization country" options={localizationOptions} defaultValue="SOUTH_AFRICA" />
      </div>

      {showAddress ? (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <TextField name="addressStreet" label="Street address" autoComplete="street-address" placeholder="12 Main Road" />
          </div>
          <TextField name="addressLine2" label="Unit, building, complex" required={false} placeholder="Unit 4, Sunset Complex" />
          <TextField name="addressSuburb" label="Suburb or township" autoComplete="address-level3" placeholder="Sandton" />
          <TextField name="addressCity" label="City" autoComplete="address-level2" placeholder="Johannesburg" />
          <TextField name="addressProvince" label="Province" autoComplete="address-level1" placeholder="Gauteng" />
          <TextField name="addressPostalCode" label="Postal code" autoComplete="postal-code" placeholder="2000" />
          <TextField name="addressCountry" label="Country" autoComplete="country-name" defaultValue="South Africa" />
        </div>
      ) : null}

      {role === "BUSINESS_OWNER" ? <TextField name="affiliateCode" label="Referral promo code (optional)" required={false} placeholder="SPARKON10" /> : null}

      <label className="flex items-start gap-3 text-sm leading-6 text-[var(--ks-ink)]">
        <input type="checkbox" name="terms" className="mt-1 h-4 w-4 accent-[var(--ks-ink)]" />
        <span>I confirm this account is being created for the selected King Sparkon role and service.</span>
      </label>

      {status ? <StatusNote tone={status.tone} message={status.message} /> : null}

      <div className="grid gap-4">
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Submitting…" : "Create account"}
        </button>
        <p className="text-center text-sm text-[var(--ks-muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-[var(--ks-ink)] underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  );
}
