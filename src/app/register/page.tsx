import type { Metadata } from "next";
import { InteractiveRegisterShell } from "@/components/auth/InteractiveRegisterShell";
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
  alternates: { canonical: "/register" },
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
  robots: { index: true, follow: true },
};

const PAYPAL_HELP = "Need a payment link? Create or find your PayPal.me link here: https://www.paypal.com/paypalme";

const planNotes: Record<string, string> = {
  FREE_USER: "Selected plan: Free User at R0. Best for tickets, job applications, cart checkout, profile, and purchase QR flows.",
  FREE_AFFILIATE: `Selected plan: Free Affiliate at R0. Add your PayPal.me link for earnings setup. ${PAYPAL_HELP}`,
  FREE_TRIAL_BUSINESS: `Selected plan: Free Trial Business for 14 days. Business owner payment link is optional during registration. ${PAYPAL_HELP}`,
  FREE_TRIAL: `Selected plan: Free Trial Business for 14 days. Business owner payment link is optional during registration. ${PAYPAL_HELP}`,
  PLUS: `Selected plan: Plus at R880 per month. Register as Business owner first, then complete billing from the dashboard. ${PAYPAL_HELP}`,
  PRO: `Selected plan: Pro at R2,300 per month. Register as Business owner for unlimited workers, tips, reports, capacity visibility, and full platform control. ${PAYPAL_HELP}`,
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

function defaultPrivilege(plan?: string, privilege?: string) {
  const normalizedPrivilege = privilege?.toUpperCase();
  if (normalizedPrivilege && privilegeNotes[normalizedPrivilege]) return normalizedPrivilege;
  const normalizedPlan = plan?.toUpperCase();
  if (normalizedPlan === "FREE_AFFILIATE") return "AFFILIATE";
  if (normalizedPlan === "FREE_TRIAL_BUSINESS" || normalizedPlan === "FREE_TRIAL" || normalizedPlan === "PLUS" || normalizedPlan === "PRO") return "BUSINESS_OWNER";
  return "USER";
}

function defaultService(plan: string | undefined, service: string | undefined, privilege: string) {
  const normalizedService = service?.toUpperCase();
  if (normalizedService && serviceNotes[normalizedService]) return normalizedService;
  const normalizedPlan = plan?.toUpperCase();
  if (privilege === "USER" || normalizedPlan === "FREE_USER") return "FREE_USER_ACCESS";
  if (privilege === "AFFILIATE" || normalizedPlan === "FREE_AFFILIATE") return "FREE_AFFILIATE_ACCESS";
  return "FULL_BUSINESS_SUITE";
}

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ plan?: string; service?: string; privilege?: string }> }) {
  const { plan, service, privilege } = await searchParams;
  const normalizedPlan = plan?.toUpperCase();
  const selectedPrivilege = defaultPrivilege(plan, privilege);
  const selectedService = defaultService(plan, service, selectedPrivilege);
  const selectedPlanNote = normalizedPlan ? planNotes[normalizedPlan] : undefined;
  const composedNote = [privilegeNotes[selectedPrivilege], selectedPlanNote].filter(Boolean).join(" ");

  return (
    <InteractiveRegisterShell
      endpoint="/api/auth/register"
      title="Register your King Sparkon access"
      description="Choose User, Business owner, or Affiliate. The form stays simple, then opens beautiful sections only when your role needs them."
      note={composedNote}
      fields={[
        { name: "serviceRegisteringFor", label: "Choose role", type: "select", placeholder: "Choose User, Business owner, or Affiliate", autoComplete: "off", defaultValue: selectedPrivilege, helper: "Start here. The form changes based on this role.", options: registrationPrivilegeOptions.map((option) => ({ label: option.label, value: option.value })) },
        { name: "serviceRegistrationType", label: "Service registering for", type: "hidden", placeholder: selectedService, autoComplete: "off", defaultValue: selectedService },
        { name: "businessName", label: "Business name", type: "text", placeholder: "Example: Sparkon Retail Store", autoComplete: "organization", visibleForPrivileges: ["BUSINESS_OWNER"], helper: "Required for Business owner." },
        { name: "username", label: "Username", type: "text", placeholder: "Example: sparkon_user", autoComplete: "username", helper: "Required. This becomes your login username." },
        { name: "emailAddress", label: "Email address", type: "email", placeholder: "Example: owner@sparkonstore.co.za", autoComplete: "email", helper: "Required. Verification and account messages are sent here." },
        { name: "cellphoneNumber", label: "Cellphone number", type: "tel", placeholder: "Example: +27821234567", autoComplete: "tel", required: false, visibleForPrivileges: ["USER", "BUSINESS_OWNER", "AFFILIATE"], helper: "Optional. Use international format for WhatsApp or account contact." },
        { name: "affiliateCode", label: "Reference code", type: "text", placeholder: "Example: KING-USER-2026", autoComplete: "off", required: false, visibleForPrivileges: ["USER"], helper: "Optional. Enter the reference, referral, or promo code from the person who invited you." },
        { name: "businessPaypalLink", label: "Business PayPal payment link", type: "url", placeholder: "Example: https://paypal.me/kingsparkonstore", autoComplete: "url", required: false, visibleForPrivileges: ["BUSINESS_OWNER"], helper: `Optional for Business owner payments during registration. ${PAYPAL_HELP}` },
        { name: "paypalLink", label: "Affiliate PayPal link", type: "url", placeholder: "Example: https://paypal.me/kingaffiliate", autoComplete: "url", visibleForPrivileges: ["AFFILIATE"], helper: `Required for Affiliate. Used for affiliate earnings setup. ${PAYPAL_HELP}` },
        { name: "password", label: "Create password", type: "password", placeholder: "Minimum 8 characters with letters and numbers", autoComplete: "new-password", helper: "Required. Use a strong password for this account." },
        { name: "addressStreet", label: "Street address", type: "text", placeholder: "Example: 12 Main Road", autoComplete: "street-address", visibleForPrivileges: ["USER", "BUSINESS_OWNER"], section: "address", helper: "Required for User and Business owner." },
        { name: "addressLine2", label: "Unit, building, complex", type: "text", placeholder: "Example: Unit 4, Sparkon Heights", autoComplete: "address-line2", required: false, visibleForPrivileges: ["USER", "BUSINESS_OWNER"], section: "address" },
        { name: "addressSuburb", label: "Suburb or township", type: "text", placeholder: "Example: Sandton", autoComplete: "address-level3", visibleForPrivileges: ["USER", "BUSINESS_OWNER"], section: "address" },
        { name: "addressCity", label: "City", type: "text", placeholder: "Example: Johannesburg", autoComplete: "address-level2", visibleForPrivileges: ["USER", "BUSINESS_OWNER"], section: "address" },
        { name: "addressProvince", label: "Province", type: "text", placeholder: "Example: Gauteng", autoComplete: "address-level1", visibleForPrivileges: ["USER", "BUSINESS_OWNER"], section: "address" },
        { name: "addressPostalCode", label: "Postal code", type: "text", placeholder: "Example: 2196", autoComplete: "postal-code", visibleForPrivileges: ["USER", "BUSINESS_OWNER"], section: "address" },
        { name: "addressCountry", label: "Country", type: "text", placeholder: "South Africa", autoComplete: "country-name", defaultValue: "South Africa", visibleForPrivileges: ["USER", "BUSINESS_OWNER"], section: "address" },
        { name: "affiliateCode", label: "Who referred you? Promo code", type: "text", placeholder: "Example: KING-PROMO-2026", autoComplete: "off", required: false, visibleForPrivileges: ["BUSINESS_OWNER"], section: "referral", helper: "Optional. Do not use this for User or Affiliate registration." },
        { name: "localizationCountry", label: "Localization country", type: "select", placeholder: "SOUTH_AFRICA", autoComplete: "country-name", defaultValue: "SOUTH_AFRICA", helper: "Required. Choose South Africa for local pricing, phone, and payment copy.", options: [{ label: "South Africa", value: "SOUTH_AFRICA" }, { label: "Rest of the world", value: "REST_OF_WORLD" }] },
      ]}
    />
  );
}
