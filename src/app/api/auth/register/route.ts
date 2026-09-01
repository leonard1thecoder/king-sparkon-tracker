import { NextResponse } from "next/server";
import { postToBackendAuth } from "@/lib/backend-auth";

const ALLOWED_GENDERS = new Set(["MALE", "FEMALE", "OTHER", "PREFER_NOT_TO_SAY"]);

function normalizeGender(value: unknown) {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim().toUpperCase();
  return ALLOWED_GENDERS.has(normalized) ? normalized : undefined;
}

export async function POST(request: Request) {
  let payload: Record<string, unknown> = {};
  try {
    payload = (await request.clone().json()) as Record<string, unknown>;
  } catch {
    payload = {};
  }

  const privilege = typeof payload.serviceRegisteringFor === "string" ? payload.serviceRegisteringFor.trim().toUpperCase() : "";

  // Backend contract for USER: gender required, no physicalAddress or affiliateCode
  if (privilege === "USER") {
    const gender = normalizeGender(payload.gender);
    if (!gender) {
      return NextResponse.json({ message: "Gender is required for User registration. Choose MALE, FEMALE, OTHER or PREFER_NOT_TO_SAY." }, { status: 400 });
    }
    payload.gender = gender;
    payload.physicalAddress = undefined;
    delete payload.physicalAddress;
    delete payload.affiliateCode;
    delete payload.addressStreet;
    delete payload.addressLine2;
    delete payload.addressSuburb;
    delete payload.addressCity;
    delete payload.addressProvince;
    delete payload.addressPostalCode;
    delete payload.addressCountry;
    // Ensure empty strings are not sent
    for (const key of ["addressStreet", "addressLine2", "addressSuburb", "addressCity", "addressProvince", "addressPostalCode", "addressCountry", "physicalAddress", "affiliateCode"]) {
      if (payload[key] === "" || payload[key] == null) delete payload[key];
    }
  } else {
    // For non-USER, gender is optional but if present normalize it
    if (payload.gender != null) {
      const g = normalizeGender(payload.gender);
      if (g) payload.gender = g;
      else delete payload.gender;
    }
  }

  return postToBackendAuth(request, "/api/auth/register", { payload });
}
