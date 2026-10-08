// Shared by the register forms. Keeps the request body identical to the
// contract the backend already receives: address parts are joined into
// physicalAddress, the service type is derived from the role, and USER never
// sends address or referral data.

export const REGISTER_ROLES = ["USER", "BUSINESS_OWNER", "AFFILIATE", "ARTIST"] as const;
export type RegisterRole = (typeof REGISTER_ROLES)[number];

export function normalizeGender(value: string | undefined) {
  if (!value) return undefined;
  const normalized = value.trim().toUpperCase();
  if (["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"].includes(normalized)) return normalized;
  return value.trim();
}

export function buildRegisterPayload(formData: FormData) {
  const payload: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key === "terms" || typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) payload[key] = trimmed;
  }

  // Backend contract: USER sends gender, never physicalAddress or affiliateCode
  if (payload.gender) payload.gender = normalizeGender(payload.gender) ?? payload.gender;
  if (payload.serviceRegisteringFor === "USER") {
    delete payload.physicalAddress;
    delete payload.affiliateCode;
    delete payload.addressStreet;
    delete payload.addressLine2;
    delete payload.addressSuburb;
    delete payload.addressCity;
    delete payload.addressProvince;
    delete payload.addressPostalCode;
    delete payload.addressCountry;
  } else {
    const parts = [
      payload.addressStreet,
      payload.addressLine2,
      payload.addressSuburb,
      payload.addressCity,
      payload.addressProvince,
      payload.addressPostalCode,
      payload.addressCountry,
    ].filter(Boolean);
    if (parts.length) payload.physicalAddress = parts.join(", ");
  }

  if (payload.serviceRegisteringFor === "USER") payload.serviceRegistrationType = "FREE_USER_ACCESS";
  if (payload.serviceRegisteringFor === "AFFILIATE") payload.serviceRegistrationType = "FREE_AFFILIATE_ACCESS";
  if (payload.serviceRegisteringFor === "ARTIST") payload.serviceRegistrationType = "ARTIST_ACCESS";
  if (
    payload.serviceRegisteringFor === "BUSINESS_OWNER" &&
    (!payload.serviceRegistrationType ||
      payload.serviceRegistrationType === "FREE_USER_ACCESS" ||
      payload.serviceRegistrationType === "FREE_AFFILIATE_ACCESS" ||
      payload.serviceRegistrationType === "ARTIST_ACCESS")
  ) {
    payload.serviceRegistrationType = "FULL_BUSINESS_SUITE";
  }

  return payload;
}
