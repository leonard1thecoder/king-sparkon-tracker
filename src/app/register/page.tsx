import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Register Barcode Inventory Workspace",
  description:
    "Create a King Sparkon Tracker owner account for barcode product tracking, stock control, worker scanning, reports, audit logs, and billing.",
};

const planNotes: Record<string, string> = {
  FREE_TRIAL: "Selected plan: Free 14 day trial. Create the owner workspace first, then manage billing from the dashboard.",
  PLUS: "Selected plan: Plus at R880 per month. Create the owner workspace first, then complete billing from the dashboard.",
  PRO: "Selected plan: Pro at R2,300 per month. Create the owner workspace first, then complete billing from the dashboard.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const { plan } = await searchParams;
  const selectedPlanNote = plan ? planNotes[plan.toUpperCase()] : undefined;

  return (
    <AuthShell
      mode="register"
      endpoint="/api/auth/register"
      eyebrow="Create account"
      title="Register your business workspace"
      description="Create the owner account and business workspace for products, barcode capacity, workers, reports, claims, transactions, audit logs, and billing."
      submitLabel="Create account"
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Sign in"
      note={selectedPlanNote}
      visualTitle="Launch a barcode inventory workspace."
      visualText="Each business gets protected product records, worker barcode assignment, stock movement, claims, reports, and audit history from the first sign-in."
      fields={[
        {
          name: "businessName",
          label: "Business name",
          type: "text",
          placeholder: "King Retail Group",
          autoComplete: "organization",
          icon: "business",
        },
        {
          name: "username",
          label: "Username",
          type: "text",
          placeholder: "owner",
          autoComplete: "username",
          icon: "user",
        },
        {
          name: "emailAddress",
          label: "Email address",
          type: "email",
          placeholder: "owner@gmail.com",
          autoComplete: "email",
          icon: "email",
        },
        {
          name: "password",
          label: "Password",
          type: "password",
          placeholder: "Create a strong password",
          autoComplete: "new-password",
          icon: "lock",
        },
        {
          name: "localizationCountry",
          label: "Localization country",
          type: "text",
          placeholder: "SOUTH_AFRICA",
          autoComplete: "country-name",
          icon: "country",
          defaultValue: "SOUTH_AFRICA",
          options: [
            { label: "South Africa", value: "SOUTH_AFRICA" },
            { label: "Rest of the world", value: "REST_OF_WORLD" },
          ],
        },
      ]}
    />
  );
}
