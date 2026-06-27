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
      title="Create a King Sparkon business workspace"
      description="Register the owner account and workspace details needed for products, barcode capacity, workers, stock reports, claims, transactions, billing, tips, and affiliate referrals."
      submitLabel="Create workspace"
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Sign in"
      note={selectedPlanNote}
      visualTitle="Launch a barcode inventory workspace."
      visualText="Each business gets protected product records, worker barcode assignment, stock movement, claims, reports, tip visibility, affiliate referrals, and audit history from the first sign-in."
      fields={[
        { name: "businessName", label: "Business name", type: "text", placeholder: "Example: Sparkon Retail Store", autoComplete: "organization", icon: "business", helper: "Required. The company or trading name shown in the dashboard." },
        { name: "businessDescription", label: "Business description", type: "textarea", placeholder: "Example: Barcode-enabled retail store selling beverages, snacks, and returnable bottles.", autoComplete: "off", icon: "business", required: false, helper: "Optional. Describe what the business sells or tracks." },
        { name: "physicalAddress", label: "Physical address", type: "text", placeholder: "Example: 12 Main Road, Johannesburg, South Africa", autoComplete: "street-address", icon: "business", required: false, helper: "Optional. Useful for branch, delivery, and stock location context." },
        { name: "cellphoneNumber", label: "Cellphone number", type: "tel", placeholder: "Example: +27821234567", autoComplete: "tel", icon: "business", required: false, helper: "Optional. Use international format for WhatsApp or billing contact." },
        { name: "affiliateCode", label: "Affiliate code", type: "text", placeholder: "Example: AFF-ALICE-1234", autoComplete: "off", icon: "key", required: false, helper: "Optional. Add this only when a promoter shared a referral code." },
        { name: "username", label: "Owner username", type: "text", placeholder: "Example: owner_admin", autoComplete: "username", icon: "user", helper: "Required. This becomes the first owner login username." },
        { name: "emailAddress", label: "Owner email address", type: "email", placeholder: "Example: owner@sparkonstore.co.za", autoComplete: "email", icon: "email", helper: "Required. Verification and account messages are sent here." },
        { name: "password", label: "Create password", type: "password", placeholder: "Minimum 8 characters with letters and numbers", autoComplete: "new-password", icon: "lock", helper: "Required. Use a strong password for the owner account." },
        {
          name: "localizationCountry",
          label: "Localization country",
          type: "text",
          placeholder: "SOUTH_AFRICA",
          autoComplete: "country-name",
          icon: "country",
          defaultValue: "SOUTH_AFRICA",
          helper: "Required. Choose South Africa for local pricing, phone, and payment copy.",
          options: [
            { label: "South Africa", value: "SOUTH_AFRICA" },
            { label: "Rest of the world", value: "REST_OF_WORLD" },
          ],
        },
      ]}
    />
  );
}
