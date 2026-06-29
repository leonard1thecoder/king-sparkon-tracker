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
    description: "Register as a user, business owner, or affiliate for barcode inventory, QR tickets, worker tips, affiliates, payments, and reporting.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker register page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register for King Sparkon Tracker",
    description: "Launch premium barcode tracking access with user, business owner, and affiliate registration privileges.",
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

const privilegeNotes: Record<string, string> = {
  BUSINESS_OWNER: "Privilege selected: Business owner. The backend creates an Owner account, business workspace, and business QR code.",
  USER: "Privilege selected: User. The backend creates a User account for customer access and purchase QR flows.",
  AFFILIATE: "Privilege selected: Affiliate. The backend creates an Affiliate account with referral code, promotion link, and QR code.",
};

const serviceNotes: Record<string, string> = {
  FULL_BUSINESS_SUITE: "Service selected: Full Business Suite for inventory, QR tickets, worker tips, promotions, affiliates, payments, and reports.",
  BARCODE_INVENTORY: "Service selected: Barcode Inventory for products, stock movement, scanning, branches, and audit reports.",
  QR_TICKET_EVENTS: "Service selected: QR Ticket Events for event setup, ticket sales, capacity tracking, buyer QR codes, and gate verification.",
  WORKER_TIPS_PAYOUTS: "Service selected: Worker Tips & Payouts for worker QR codes, payment links, owner review, platform fees, and payout status.",
  AFFILIATE_PROMOTIONS: "Service selected: Affiliate Promotions for referral links, QR campaigns, commission visibility, and promoter performance.",
};

const serviceOptions: Array<{ label: string; value: string }> = [
  { label: "Full Business Suite — inventory, tickets, tips, affiliates, payments", value: "FULL_BUSINESS_SUITE" },
  { label: "Barcode Inventory — products, scanning, stock movement", value: "BARCODE_INVENTORY" },
  { label: "QR Ticket Events — event tickets and gate verification", value: "QR_TICKET_EVENTS" },
  { label: "Worker Tips & Payouts — QR tips and owner payout review", value: "WORKER_TIPS_PAYOUTS" },
  { label: "Affiliate Promotions — referral links and campaign QR tracking", value: "AFFILIATE_PROMOTIONS" },
];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; service?: string; privilege?: string }>;
}) {
  const { plan, service, privilege } = await searchParams;
  const normalizedPlan = plan?.toUpperCase();
  const normalizedService = service?.toUpperCase();
  const normalizedPrivilege = privilege?.toUpperCase();
  const selectedPlanNote = normalizedPlan ? planNotes[normalizedPlan] : undefined;
  const selectedService = normalizedService && serviceNotes[normalizedService] ? normalizedService : "FULL_BUSINESS_SUITE";
  const selectedPrivilege = normalizedPrivilege && privilegeNotes[normalizedPrivilege] ? normalizedPrivilege : "BUSINESS_OWNER";
  const selectedServiceNote = serviceNotes[selectedService];
  const selectedPrivilegeNote = privilegeNotes[selectedPrivilege];
  const composedNote = [selectedPrivilegeNote, selectedServiceNote, selectedPlanNote].filter(Boolean).join(" ");

  return (
    <AuthShell
      mode="register"
      endpoint="/api/auth/register"
      eyebrow="Create account"
      title="Register your King Sparkon access"
      description="Choose what you are registering for as a backend privilege: User, Business owner, or Affiliate. Keep the service choice too, so the workspace still knows whether to prioritize inventory, tickets, worker tips, affiliate promotions, or the full suite."
      submitLabel="Create account"
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Sign in"
      note={composedNote}
      visualTitle="Privilege-aware registration."
      visualText="The register flow now sends the selected privilege to the backend, while preserving the existing service choice for onboarding, dashboard routing, and product context."
      fields={[
        { name: "serviceRegisteringFor", label: "Registering for privilege", type: "select", placeholder: "Choose User, Business owner, or Affiliate", autoComplete: "off", icon: "key", defaultValue: selectedPrivilege, helper: "Required. This maps directly to the backend privilege: User, Owner, or Affiliate.", options: registrationPrivilegeOptions.map((option) => ({ label: option.label, value: option.value })) },
        { name: "serviceRegistrationType", label: "Service registering for", type: "select", placeholder: "Choose the King Sparkon service this workspace needs", autoComplete: "off", icon: "service", defaultValue: selectedService, helper: "Required. This keeps the service focus for onboarding and dashboard UX without changing the account privilege.", options: serviceOptions },
        { name: "businessName", label: "Business name", type: "text", placeholder: "Example: Sparkon Retail Store", autoComplete: "organization", icon: "business", required: false, helper: "Required only when registering as Business owner. This is the company or trading name shown in the dashboard." },
        { name: "businessDescription", label: "Business description", type: "textarea", placeholder: "Example: Barcode-enabled retail store selling beverages, snacks, and returnable bottles.", autoComplete: "off", icon: "business", required: false, helper: "Optional for Business owners. Describe what the business sells or tracks." },
        { name: "physicalAddress", label: "Physical address", type: "text", placeholder: "Example: 12 Main Road, Johannesburg, South Africa", autoComplete: "street-address", icon: "business", required: false, helper: "Optional. Useful for owner, affiliate, billing, branch, delivery, and stock location context." },
        { name: "cellphoneNumber", label: "Cellphone number", type: "tel", placeholder: "Example: +27821234567", autoComplete: "tel", icon: "business", required: false, helper: "Optional. Use international format for WhatsApp, billing, affiliate, or user contact." },
        { name: "affiliateCode", label: "Affiliate code", type: "text", placeholder: "Example: AFF-ALICE-1234", autoComplete: "off", icon: "key", required: false, helper: "Optional. Add this when a promoter shared a referral code for a Business owner registration." },
        { name: "paypalLink", label: "Affiliate PayPal link", type: "url", placeholder: "Example: https://paypal.me/sparkonaffiliate", autoComplete: "url", icon: "key", required: false, helper: "Optional. Add this when registering as Affiliate and you already have a payout link." },
        { name: "username", label: "Username", type: "text", placeholder: "Example: sparkon_user", autoComplete: "username", icon: "user", helper: "Required. This becomes the login username for the selected privilege." },
        { name: "emailAddress", label: "Email address", type: "email", placeholder: "Example: owner@sparkonstore.co.za", autoComplete: "email", icon: "email", helper: "Required. Verification and account messages are sent here." },
        { name: "password", label: "Create password", type: "password", placeholder: "Minimum 8 characters with letters and numbers", autoComplete: "new-password", icon: "lock", helper: "Required. Use a strong password for this account." },
        { name: "localizationCountry", label: "Localization country", type: "text", placeholder: "SOUTH_AFRICA", autoComplete: "country-name", icon: "country", defaultValue: "SOUTH_AFRICA", helper: "Required. Choose South Africa for local pricing, phone, and payment copy.", options: [{ label: "South Africa", value: "SOUTH_AFRICA" }, { label: "Rest of the world", value: "REST_OF_WORLD" }] },
      ]}
    />
  );
}
