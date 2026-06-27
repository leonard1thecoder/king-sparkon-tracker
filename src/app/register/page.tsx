import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = {
  title: "Register | Barcode Inventory Workspace",
  description:
    "Create a King Sparkon Tracker business workspace for barcode inventory scanning, QR verification, stock movement, worker tips, affiliate referrals, payments, promotions, and audit-ready reports.",
  keywords: [
    "King Sparkon Tracker register",
    "barcode inventory software registration",
    "QR stock tracking signup",
    "business inventory dashboard",
    "South Africa barcode scanner software",
    "worker tip QR code platform",
  ],
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Register for King Sparkon Tracker",
    description: "Create a barcode inventory workspace for scanning, stock movement, worker tips, affiliates, payments, and reporting.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker register page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register for King Sparkon Tracker",
    description: "Launch a premium barcode inventory workspace with scanning, reports, payments, tips, and affiliate visibility.",
    images: ["/king-sparkon-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
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
      description="Create the owner account and business workspace for products, barcode capacity, workers, reports, claims, transactions, audit logs, billing, worker tips, and affiliate referrals. Email verification is required before login when backend policy enforces it."
      submitLabel="Create workspace"
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Sign in"
      note={selectedPlanNote}
      visualTitle="Launch a barcode inventory workspace."
      visualText="Each business gets protected product records, worker barcode assignment, stock movement, claims, reports, tip visibility, affiliate referrals, and audit history from the first sign-in."
      fields={[
        { name: "businessName", label: "Business name", type: "text", placeholder: "Spark Store", autoComplete: "organization", icon: "business" },
        { name: "businessDescription", label: "Business description", type: "textarea", placeholder: "Barcode-enabled retail store selling beverages and convenience products.", autoComplete: "off", icon: "business", required: false },
        { name: "physicalAddress", label: "Physical address", type: "text", placeholder: "12 Main Road, Johannesburg", autoComplete: "street-address", icon: "business", required: false },
        { name: "cellphoneNumber", label: "Cellphone number", type: "tel", placeholder: "+27821234567", autoComplete: "tel", icon: "business", required: false },
        { name: "affiliateCode", label: "Affiliate code", type: "text", placeholder: "AFF-ALICE-1234", autoComplete: "off", icon: "key", required: false },
        { name: "username", label: "Username", type: "text", placeholder: "owner", autoComplete: "username", icon: "user" },
        { name: "emailAddress", label: "Email address", type: "email", placeholder: "owner@example.com", autoComplete: "email", icon: "email" },
        { name: "password", label: "Password", type: "password", placeholder: "Create a strong password", autoComplete: "new-password", icon: "lock" },
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
