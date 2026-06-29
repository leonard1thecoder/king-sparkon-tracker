import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";
import { registrationPrivilegeOptions } from "@/lib/auth/registration";

export const metadata: Metadata = {
  title: "Register | Barcode Inventory Workspace",
  description:
    "Create a King Sparkon Tracker account as a user, business owner, or affiliate for barcode inventory scanning, QR verification, stock movement, worker tips, affiliate referrals, payments, promotions, and audit-ready reports.",
  keywords: [
    "King Sparkon Tracker register",
    "barcode inventory software registration",
    "QR stock tracking signup",
    "business inventory dashboard",
    "South Africa barcode scanner software",
    "worker tip QR code platform",
    "affiliate barcode tracker registration",
  ],
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Register for King Sparkon Tracker",
    description: "Register as a user, business owner, or affiliate for barcode inventory, QR payments, referrals, tips, and reporting.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker register page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register for King Sparkon Tracker",
    description: "Launch premium barcode tracking access with user, owner, and affiliate registration privileges.",
    images: ["/king-sparkon-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const planNotes: Record<string, string> = {
  FREE_TRIAL: "Selected plan: Free 14 day trial. Register as Business owner to create the owner workspace first, then manage billing from the dashboard.",
  PLUS: "Selected plan: Plus at R880 per month. Register as Business owner to create the owner workspace first, then complete billing from the dashboard.",
  PRO: "Selected plan: Pro at R2,300 per month. Register as Business owner to create the owner workspace first, then complete billing from the dashboard.",
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
      title="Register your King Sparkon access"
      description="Choose exactly what you are registering for: User, Business owner, or Affiliate. The backend now maps this selection to the correct privilege before creating the account, workspace, referral, and QR flows."
      submitLabel="Create account"
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Sign in"
      note={selectedPlanNote ?? "Business owners get a workspace QR code. Affiliates get a referral QR code. Users get access for purchase and payment QR flows."}
      visualTitle="Privilege-aware registration."
      visualText="The registration form now sends the selected privilege to the backend, so user accounts, business owner workspaces, and affiliate referral accounts are created through one clean registration experience."
      fields={[
        {
          name: "serviceRegisteringFor",
          label: "Service registering for",
          type: "text",
          placeholder: "Choose User, Business owner, or Affiliate",
          autoComplete: "off",
          icon: "key",
          defaultValue: "BUSINESS_OWNER",
          helper: "Required. This controls the backend privilege: User, Owner, or Affiliate.",
          options: registrationPrivilegeOptions.map((option) => ({ label: option.label, value: option.value })),
        },
        { name: "businessName", label: "Business name", type: "text", placeholder: "Example: Sparkon Retail Store", autoComplete: "organization", icon: "business", required: false, helper: "Required only when registering as Business owner. This is the workspace name shown in the dashboard." },
        { name: "businessDescription", label: "Business description", type: "textarea", placeholder: "Example: Barcode-enabled retail store selling beverages, snacks, and returnable bottles.", autoComplete: "off", icon: "business", required: false, helper: "Optional for Business owners. Describe what the business sells or tracks." },
        { name: "physicalAddress", label: "Physical address", type: "text", placeholder: "Example: 12 Main Road, Johannesburg, South Africa", autoComplete: "street-address", icon: "business", required: false, helper: "Optional. Useful for owner, affiliate, billing, stock location, and onboarding context." },
        { name: "cellphoneNumber", label: "Cellphone number", type: "tel", placeholder: "Example: +27821234567", autoComplete: "tel", icon: "business", required: false, helper: "Optional. Use international format for WhatsApp, billing, affiliate, or user contact." },
        { name: "affiliateCode", label: "Affiliate code", type: "text", placeholder: "Example: AFF-ALICE-1234", autoComplete: "off", icon: "key", required: false, helper: "Optional. Add this when a promoter shared a referral code for a Business owner registration." },
        { name: "paypalLink", label: "Affiliate PayPal link", type: "url", placeholder: "Example: https://paypal.me/sparkonaffiliate", autoComplete: "url", icon: "key", required: false, helper: "Optional. Add this when registering as Affiliate and you already have a payout link." },
        { name: "username", label: "Username", type: "text", placeholder: "Example: sparkon_user", autoComplete: "username", icon: "user", helper: "Required. This becomes the login username for the selected privilege." },
        { name: "emailAddress", label: "Email address", type: "email", placeholder: "Example: owner@sparkonstore.co.za", autoComplete: "email", icon: "email", helper: "Required. Verification and account messages are sent here." },
        { name: "password", label: "Create password", type: "password", placeholder: "Minimum 8 characters with letters and numbers", autoComplete: "new-password", icon: "lock", helper: "Required. Use a strong password for this account." },
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
