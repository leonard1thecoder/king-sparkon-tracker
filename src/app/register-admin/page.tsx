import type { Metadata } from "next";
import { InteractiveRegisterShell } from "@/components/auth/InteractiveRegisterShell";

const ADMIN_EMAIL = "leonard1thecoder@gmail.com";

export const metadata: Metadata = {
  title: "Admin Registration | King Sparkon Tracker",
  description: "Restricted King Sparkon Tracker admin registration page for the approved platform owner email only.",
  alternates: { canonical: "/register-admin" },
  robots: { index: false, follow: false },
};

export default function AdminRegisterPage() {
  return (
    <InteractiveRegisterShell
      endpoint="/api/auth/register"
      title="Create the King Sparkon admin account"
      description={`This separate registration page is locked to ${ADMIN_EMAIL}. It uses the same simple interactive form style, then the dashboard guard routes the account to Admin when backend role claims are issued.`}
      note={`Admin registration is allowed only for ${ADMIN_EMAIL}. The form sends ADMIN privilege metadata to the backend and blocks any other email at the UI layer.`}
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
        { name: "username", label: "Admin username", type: "text", placeholder: "Example: leonard_admin", autoComplete: "username", helper: "Required. This becomes the login username for the Admin dashboard." },
        { name: "emailAddress", label: "Admin email address", type: "email", placeholder: ADMIN_EMAIL, autoComplete: "email", defaultValue: ADMIN_EMAIL, readOnly: true, helper: `Locked. Admin registration accepts only ${ADMIN_EMAIL}.` },
        { name: "password", label: "Create admin password", type: "password", placeholder: "Minimum 8 characters with letters and numbers", autoComplete: "new-password", helper: "Required. Use a strong password for platform access." },
        { name: "localizationCountry", label: "Localization country", type: "select", placeholder: "SOUTH_AFRICA", autoComplete: "country-name", defaultValue: "SOUTH_AFRICA", helper: "Required. Admin dashboard defaults to South Africa operational context.", options: [{ label: "South Africa", value: "SOUTH_AFRICA" }, { label: "Rest of the world", value: "REST_OF_WORLD" }] },
      ]}
    />
  );
}
