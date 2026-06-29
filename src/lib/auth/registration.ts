export type ServiceRegistrationFor = "USER" | "BUSINESS_OWNER" | "AFFILIATE";

export type RegistrationPrivilegeOption = {
  label: string;
  value: ServiceRegistrationFor;
  description: string;
};

export const registrationPrivilegeOptions: RegistrationPrivilegeOption[] = [
  {
    label: "Business owner",
    value: "BUSINESS_OWNER",
    description: "Creates an Owner privilege and a business workspace with its own QR code.",
  },
  {
    label: "User",
    value: "USER",
    description: "Creates a User privilege for customer purchases, QR payment flows, and personal account access.",
  },
  {
    label: "Affiliate",
    value: "AFFILIATE",
    description: "Creates an Affiliate privilege with a referral code, promotion link, and affiliate QR code.",
  },
];

export function normalizeRegistrationPrivilege(value: string | null | undefined): ServiceRegistrationFor {
  const normalized = value?.trim().toUpperCase().replace(/[\s-]+/g, "_");

  if (!normalized) return "BUSINESS_OWNER";
  if (normalized === "OWNER" || normalized === "BUSINESS" || normalized === "BUSINESS_OWNER") return "BUSINESS_OWNER";
  if (normalized === "AFFILIATE" || normalized === "AFFLIATE") return "AFFILIATE";
  if (normalized === "USER" || normalized === "CUSTOMER" || normalized === "CLIENT") return "USER";

  throw new Error(`Unsupported registration privilege: ${value}`);
}

export function registrationPrivilegeDescription(value: ServiceRegistrationFor): string {
  return registrationPrivilegeOptions.find((option) => option.value === value)?.description ?? registrationPrivilegeOptions[0].description;
}
