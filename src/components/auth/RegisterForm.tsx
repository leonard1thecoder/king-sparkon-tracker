"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { PasswordField, SelectField, StatusNote, TextField, primaryButtonClass, type SelectOption } from "@/components/auth/AuthFields";
import { REGISTER_ROLES, buildRegisterPayload, type RegisterRole } from "@/lib/auth/register-payload";
import { registrationPrivilegeOptions } from "@/lib/auth/registration";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type Status = { tone: "error" | "success"; message: string } | null;

type FieldSpec = {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "url" | "number" | "password" | "select";
  autoComplete?: string;
  options?: SelectOption[];
};

const roleOptions: SelectOption[] = registrationPrivilegeOptions.map((option) => ({ label: option.label, value: option.value }));

// Fields every role needs. "Name" is sent as the account username, which the
// backend already requires.
const baseFields: FieldSpec[] = [
  { name: "username", label: "Name", type: "text", autoComplete: "name" },
  { name: "emailAddress", label: "Email", type: "email", autoComplete: "email" },
];

const contactField: FieldSpec = { name: "cellphoneNumber", label: "Cellphone", type: "tel", autoComplete: "tel" };

const roleFields: Record<RegisterRole, FieldSpec[]> = {
  USER: [
    contactField,
    {
      name: "gender",
      label: "Gender",
      type: "select",
      options: [
        { label: "Male", value: "MALE" },
        { label: "Female", value: "FEMALE" },
        { label: "Other", value: "OTHER" },
        { label: "Prefer not to say", value: "PREFER_NOT_TO_SAY" },
      ],
    },
  ],
  BUSINESS_OWNER: [{ name: "businessName", label: "Business name", type: "text", autoComplete: "organization" }, contactField],
  AFFILIATE: [contactField, { name: "paypalLink", label: "PayPal link", type: "url", autoComplete: "url" }],
  ARTIST: [
    contactField,
    {
      name: "artistType",
      label: "Artist type",
      type: "select",
      options: [
        { label: "DJ", value: "DJ" },
        { label: "Musician", value: "MUSICIAN" },
        { label: "MCEE", value: "MCEE" },
      ],
    },
    { name: "performancesPerDay", label: "Performances per day", type: "number" },
    { name: "minimumBookingFee", label: "Minimum booking fee", type: "text" },
  ],
};

// Roles that must provide a physical address. Parts are joined by buildRegisterPayload.
const addressRoles: RegisterRole[] = ["BUSINESS_OWNER", "AFFILIATE", "ARTIST"];
const addressFields: FieldSpec[] = [
  { name: "addressStreet", label: "Street address", type: "text", autoComplete: "street-address" },
  { name: "addressSuburb", label: "Suburb", type: "text", autoComplete: "address-level3" },
  { name: "addressCity", label: "City", type: "text", autoComplete: "address-level2" },
  { name: "addressProvince", label: "Province", type: "text", autoComplete: "address-level1" },
  { name: "addressPostalCode", label: "Postal code", type: "text", autoComplete: "postal-code" },
];

function isRegisterRole(value: string): value is RegisterRole {
  return (REGISTER_ROLES as readonly string[]).includes(value);
}

function renderField(field: FieldSpec, role: RegisterRole) {
  if (field.type === "password") {
    return <PasswordField key={field.name} name={field.name} label={field.label} autoComplete={field.autoComplete ?? "new-password"} />;
  }
  if (field.type === "select") {
    return <SelectField key={field.name} name={field.name} label={field.label} options={field.options ?? []} />;
  }
  return (
    <TextField
      key={`${role}-${field.name}`}
      name={field.name}
      label={field.label}
      type={field.type}
      autoComplete={field.autoComplete}
      inputMode={field.type === "number" ? "numeric" : undefined}
      min={field.type === "number" ? 1 : undefined}
    />
  );
}

export function RegisterForm({ initialRole }: { initialRole: string }) {
  const startRole: RegisterRole = isRegisterRole(initialRole) ? initialRole : "USER";
  const [role, setRole] = useState<RegisterRole>(startRole);
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  const roleSpecific = roleFields[role];
  const showAddress = addressRoles.includes(role);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    if (!formData.get("terms")) {
      setStatus({ tone: "error", message: "Accept the Terms to create your account." });
      return;
    }

    const payload = buildRegisterPayload(formData);
    const required = [...baseFields, ...roleSpecific, ...(showAddress ? addressFields : [])];
    const missing = required.find((field) => !payload[field.name]);
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
      // Same endpoint and body contract as the previous register form.
      await axios.post("/api/auth/register", payload, { withCredentials: true });
      setStatus({ tone: "success", message: "Account created. Check your email to verify before signing in." });
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
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
      <p className="mt-2 text-sm font-semibold text-[var(--muted)]">Join King Sparkon</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
        {baseFields.map((field) => renderField(field, role))}
        <PasswordField name="password" label="Password" autoComplete="new-password" />
        {/* Role decides which fields follow, so it sits directly above them. */}
        <SelectField
          name="serviceRegisteringFor"
          label="Role"
          options={roleOptions}
          value={role}
          onChange={(value) => {
            if (isRegisterRole(value)) setRole(value);
          }}
        />


        {roleSpecific.map((field) => renderField(field, role))}

        {showAddress ? (
          <div className="grid gap-5 sm:grid-cols-2">
            {addressFields.map((field, index) => (
              <div key={field.name} className={index === 0 ? "sm:col-span-2" : undefined}>
                {renderField(field, role)}
              </div>
            ))}
          </div>
        ) : null}

        {/* Hidden values the backend already expects. */}
        <input type="hidden" name="localizationCountry" value="SOUTH_AFRICA" />
        {showAddress ? <input type="hidden" name="addressCountry" value="South Africa" /> : null}

        <label className="flex items-start gap-3 text-sm text-[var(--steel)]">
          <input type="checkbox" name="terms" className="mt-0.5 h-4 w-4 accent-[var(--signal)]" />
          <span>
            I agree to the{" "}
            <Link href="/terms" className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline">
              Terms
            </Link>
          </span>
        </label>

        {status ? <StatusNote tone={status.tone} message={status.message} /> : null}

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-[var(--ink)] hover:text-[var(--signal)]">
          Sign in
        </Link>
      </p>
    </div>
  );
}
