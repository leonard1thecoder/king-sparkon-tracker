import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";
import { registrationPrivilegeOptions } from "@/lib/auth/registration";

export const metadata: Metadata = {
  title: "Register | King Sparkon Tracker Role Access",
  description:
    "Create a King Sparkon Tracker account as a free user, free affiliate, or business owner for barcode inventory, QR tickets, cart checkout, job opportunities, worker tips, promotions, and reports.",
  keywords: [
    "King Sparkon Tracker register",
    "free user account",
    "free affiliate account",
    "barcode inventory software registration",
    "QR ticket signup",
    "job opportunities platform",
    "business inventory dashboard",
    "South Africa barcode scanner software",
  ],
  alternates: {
    canonical: "/register",
  },
  openGraph: {
    title: "Register for King Sparkon Tracker",
    description: "Register as a free user, free affiliate, or business owner for barcode inventory, tickets, jobs, tips, affiliates, cart checkout, and reporting.",
    type: "website",
    siteName: "King Sparkon Tracker",
    images: [{ url: "/king-sparkon-logo.png", width: 512, height: 512, alt: "King Sparkon Tracker register page" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Register for King Sparkon Tracker",
    description: "Choose User, Affiliate, or Business Owner and see only the fields that role needs.",
    images: ["/king-sparkon-logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const planNotes: Record<string, string> = {
  FREE_USER: "Selected plan: Free User at R0. Best for tickets, job applications, cart checkout, profile, and purchase QR flows.",
  FREE_AFFILIATE: "Selected plan: Free Affiliate at R0. Best for referral links, QR promotion cards, campaign assets, and commission visibility.",
  FREE_TRIAL_BUSINESS: "Selected plan: Free Trial Business for 14 days. Best for testing barcode inventory, tickets, jobs, tips, promotions, and reports.",
  FREE_TRIAL: "Selected plan: Free Trial Business for 14 days. Best for testing barcode inventory, tickets, jobs, tips, promotions, and reports.",
  PLUS: "Selected plan: Plus at R880 per month. Register as Business owner to create the owner workspace first, then complete billing from the dashboard.",
  PRO: "Selected plan: Pro at R2,300 per month. Register as Business owner for unlimited workers, tips, reports, capacity visibility, and full platform control.",
};

const privilegeNotes: Record<string, string> = {
  BUSINESS_OWNER: "Privilege selected: Business owner. The backend creates an Owner account, business workspace, and business QR code.",
  USER: "Privilege selected: User. The backend creates a free User account for tickets, jobs, cart checkout, profile, and purchase QR flows.",
  AFFILIATE: "Privilege selected: Affiliate. The backend creates a free Affiliate account with referral code, promotion link, and QR code.",
};

const serviceNotes: Record<string, string> = {
  FULL_BUSINESS_SUITE: "Service selected: Full Business Suite for inventory, QR tickets, cart checkout, worker tips, jobs, promotions, affiliates, payments, and reports.",
  FREE_USER_ACCESS: "Service selected: Free User Access for tickets, job applications, cart checkout, profile, and purchase QR flows.",
  FREE_AFFILIATE_ACCESS: "Service selected: Free Affiliate Access for referral links, QR promotion assets, and commission visibility.",
  BARCODE_INVENTORY: "Service selected: Barcode Inventory for products, stock movement, scanning, branches, and audit reports.",
  QR_TICKET_EVENTS: "Service selected: QR Ticket Events for event setup, ticket sales, capacity tracking, buyer QR codes, and gate verification.",
  WORKER_TIPS_PAYOUTS: "Service selected: Worker Tips & Review for worker QR codes, payment links, owner review, service fees, and status.",
  AFFILIATE_PROMOTIONS: "Service selected: Affiliate Promotions for referral links, QR campaigns, commission visibility, and promoter performance.",
};

const serviceOptions: Array<{ label: string; value: string }> = [
  { label: "Free User Access — tickets, jobs, cart checkout, QR purchases", value: "FREE_USER_ACCESS" },
  { label: "Free Affiliate Access — referrals, campaign assets, QR promotions", value: "FREE_AFFILIATE_ACCESS" },
  { label: "Full Business Suite — inventory, tickets, jobs, tips, affiliates, payments", value: "FULL_BUSINESS_SUITE" },
  { label: "Barcode Inventory — products, scanning, stock movement", value: "BARCODE_INVENTORY" },
  { label: "QR Ticket Events — event tickets and gate verification", value: "QR_TICKET_EVENTS" },
  { label: "Worker Tips & Review — QR tips and owner review", value: "WORKER_TIPS_PAYOUTS" },
  { label: "Affiliate Promotions — referral links and campaign QR tracking", value: "AFFILIATE_PROMOTIONS" },
];

function defaultPrivilege(plan?: string, privilege?: string) {
  const normalizedPrivilege = privilege?.toUpperCase();
  if (normalizedPrivilege && privilegeNotes[normalizedPrivilege]) return normalizedPrivilege;
  const normalizedPlan = plan?.toUpperCase();
  if (normalizedPlan === "FREE_USER") return "USER";
  if (normalizedPlan === "FREE_AFFILIATE") return "AFFILIATE";
  return "BUSINESS_OWNER";
}

function defaultService(plan: string | undefined, service: string | undefined, privilege: string) {
  const normalizedService = service?.toUpperCase();
  if (normalizedService && serviceNotes[normalizedService]) return normalizedService;
  const normalizedPlan = plan?.toUpperCase();
  if (privilege === "USER" || normalizedPlan === "FREE_USER") return "FREE_USER_ACCESS";
  if (privilege === "AFFILIATE" || normalizedPlan === "FREE_AFFILIATE") return "FREE_AFFILIATE_ACCESS";
  return "FULL_BUSINESS_SUITE";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; service?: string; privilege?: string }>;
}) {
  const { plan, service, privilege } = await searchParams;
  const normalizedPlan = plan?.toUpperCase();
  const selectedPrivilege = defaultPrivilege(plan, privilege);
  const selectedService = defaultService(plan, service, selectedPrivilege);
  const selectedPlanNote = normalizedPlan ? planNotes[normalizedPlan] : undefined;
  const selectedServiceNote = serviceNotes[selectedService];
  const selectedPrivilegeNote = privilegeNotes[selectedPrivilege];
  const composedNote = [selectedPrivilegeNote, selectedServiceNote, selectedPlanNote].filter(Boolean).join(" ");

  return (
    <AuthShell
      mode="register"
      endpoint="/api/auth/register"
      eyebrow="Choose your role"
      title="Register your King Sparkon access"
      description="Pick User, Business owner, or Affiliate first. The form then renders only the fields that role needs, keeping free User and free Affiliate onboarding clean."
      submitLabel="Create account"
      footerText="Already have an account?"
      footerHref="/login"
      footerLink="Sign in"
      note={composedNote}
      visualTitle="Role-aware registration."
      visualText="King Sparkon Tracker keeps the selected privilege and selected service clear so login opens the correct dashboard and every role sees the right navigation."
      fields={[
        { name: "serviceRegisteringFor", label: "Choose role", type: "select", placeholder: "Choose User, Business owner, or Affiliate", autoComplete: "off", icon: "key", defaultValue: selectedPrivilege, helper: "Required. The rest of the form changes based on this selected role.", options: registrationPrivilegeOptions.map((option) => ({ label: option.label, value: option.value })) },
        { name: "serviceRegistrationType", label: "Service registering for", type: "select", placeholder: "Choose the King Sparkon service this account needs", autoComplete: "off", icon: "service", defaultValue: selectedService, helper: "Required. User and Affiliate can stay free; Business owner can choose the operational suite.", options: serviceOptions },
        { name: "businessName", label: "Business name", type: "text", placeholder: "Example: Sparkon Retail Store", autoComplete: "organization", icon: "business", visibleForPrivileges: ["BUSINESS_OWNER"], helper: "Required for Business owner. This is the company or trading name shown in the dashboard." },
        { name: "businessDescription", label: "Business description", type: "textarea", placeholder: "Example: Barcode-enabled retail store selling beverages, snacks, and returnable bottles.", autoComplete: "off", icon: "business", required: false, visibleForPrivileges: ["BUSINESS_OWNER"], helper: "Optional for Business owner. Describe what the business sells or tracks." },
        { name: "physicalAddress", label: "Physical address", type: "text", placeholder: "Example: 12 Main Road, Johannesburg, South Africa", autoComplete: "street-address", icon: "business", required: false, visibleForPrivileges: ["BUSINESS_OWNER"], helper: "Optional. Useful for owner billing, branch, delivery, and stock location context." },
        { name: "cellphoneNumber", label: "Cellphone number", type: "tel", placeholder: "Example: +27821234567", autoComplete: "tel", icon: "business", required: false, visibleForPrivileges: ["USER", "BUSINESS_OWNER", "AFFILIATE"], helper: "Optional. Use international format for WhatsApp, billing, affiliate, or user contact." },
        { name: "affiliateCode", label: "Affiliate code", type: "text", placeholder: "Example: AFF-ALICE-1234", autoComplete: "off", icon: "key", required: false, visibleForPrivileges: ["BUSINESS_OWNER", "USER"], helper: "Optional. Add this when a promoter shared a referral code." },
        { name: "paypalLink", label: "Affiliate PayPal link", type: "url", placeholder: "Example: https://paypal.me/sparkonaffiliate", autoComplete: "url", icon: "key", required: false, visibleForPrivileges: ["AFFILIATE"], helper: "Optional. Add this when registering as Affiliate and you already have an earnings link." },
        { name: "username", label: "Username", type: "text", placeholder: "Example: sparkon_user", autoComplete: "username", icon: "user", helper: "Required. This becomes the login username for the selected role." },
        { name: "emailAddress", label: "Email address", type: "email", placeholder: "Example: owner@sparkonstore.co.za", autoComplete: "email", icon: "email", helper: "Required. Verification and account messages are sent here." },
        { name: "password", label: "Create password", type: "password", placeholder: "Minimum 8 characters with letters and numbers", autoComplete: "new-password", icon: "lock", helper: "Required. Use a strong password for this account." },
        { name: "localizationCountry", label: "Localization country", type: "text", placeholder: "SOUTH_AFRICA", autoComplete: "country-name", icon: "country", defaultValue: "SOUTH_AFRICA", helper: "Required. Choose South Africa for local pricing, phone, and payment copy.", options: [{ label: "South Africa", value: "SOUTH_AFRICA" }, { label: "Rest of the world", value: "REST_OF_WORLD" }] },
      ]}
    />
  );
}
