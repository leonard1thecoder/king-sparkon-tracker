import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

const ADMIN_EMAIL = "leonard1thecoder@gmail.com";

export const metadata: Metadata = {
  title: "Admin Registration | King Sparkon Tracker",
  description: "Restricted King Sparkon Tracker admin registration page for the approved platform owner email only.",
  alternates: { canonical: "/register-admin" },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminRegisterPage() {
  return (
    <AuthShell
      mode="register"
      endpoint="/api/auth/register"
      eyebrow="Restricted admin registration"
      title="Create the King Sparkon admin account"
      description={`This separate registration page is locked to ${ADMIN_EMAIL}. It uses the same auth shell and login flow, then the dashboard guard routes the account to the Admin console when backend role claims are issued.`}
      submitLabel="Create admin account"
      footerText="Already registered as admin?"
      footerHref="/login"
      footerLink="Sign in"
      note={`Admin registration is allowed only for ${ADMIN_EMAIL}. The form sends ADMIN privilege metadata to the backend and blocks any other email at the UI layer.`}
      visualTitle="Platform admin registration."
      visualText="A restricted path for creating the platform admin account that manages users, businesses, tickets, jobs, applications, reports, audit logs, and settings."
      allowedEmailAddress={ADMIN_EMAIL}
      extraPayload={{
        serviceRegisteringFor: "ADMIN",
        serviceRegistrationType: "PLATFORM_ADMIN",
        privilege: "ADMIN",
        role: "ADMIN",
      }}
      fields={[
        { name: "serviceRegisteringFor", label: "Admin privilege", type: "hidden", placeholder: "ADMIN", autoComplete: "off", defaultValue: "ADMIN" },
        { name: "serviceRegistrationType", label: "Platform admin service", type: "hidden", placeholder: "PLATFORM_ADMIN", autoComplete: "off", defaultValue: "PLATFORM_ADMIN" },
        { name: "username", label: "Admin username", type: "text", placeholder: "Example: leonard_admin", autoComplete: "username", icon: "user", helper: "Required. This becomes the login username for the Admin dashboard." },
        { name: "emailAddress", label: "Admin email address", type: "email", placeholder: ADMIN_EMAIL, autoComplete: "email", icon: "email", defaultValue: ADMIN_EMAIL, readOnly: true, helper: `Locked. Admin registration accepts only ${ADMIN_EMAIL}.` },
        { name: "password", label: "Create admin password", type: "password", placeholder: "Minimum 8 characters with letters and numbers", autoComplete: "new-password", icon: "lock", helper: "Required. Use a strong password for platform access." },
        { name: "localizationCountry", label: "Localization country", type: "text", placeholder: "SOUTH_AFRICA", autoComplete: "country-name", icon: "country", defaultValue: "SOUTH_AFRICA", helper: "Required. Admin dashboard defaults to South Africa operational context.", options: [{ label: "South Africa", value: "SOUTH_AFRICA" }, { label: "Rest of the world", value: "REST_OF_WORLD" }] },
      ]}
    />
  );
}
