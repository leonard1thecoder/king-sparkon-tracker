import { describe, expect, test } from "vitest";
import { normalizeRegistrationPrivilege, registrationPrivilegeDescription } from "./registration";

describe("registration privilege mapping", () => {
  test("accepts positive privilege values used by the registration UI", () => {
    expect(normalizeRegistrationPrivilege("BUSINESS_OWNER")).toBe("BUSINESS_OWNER");
    expect(normalizeRegistrationPrivilege("user")).toBe("USER");
    expect(normalizeRegistrationPrivilege("affiliate")).toBe("AFFILIATE");
    expect(normalizeRegistrationPrivilege("business owner")).toBe("BUSINESS_OWNER");
  });

  test("keeps legacy owner registration as the safe default", () => {
    expect(normalizeRegistrationPrivilege(undefined)).toBe("BUSINESS_OWNER");
    expect(normalizeRegistrationPrivilege(" ")).toBe("BUSINESS_OWNER");
  });

  test("rejects unsupported negative privilege values before they hit the backend", () => {
    expect(() => normalizeRegistrationPrivilege("super-admin")).toThrow("Unsupported registration privilege");
  });

  test("returns clear copy for each registration privilege", () => {
    expect(registrationPrivilegeDescription("BUSINESS_OWNER")).toContain("Owner privilege");
    expect(registrationPrivilegeDescription("USER")).toContain("User privilege");
    expect(registrationPrivilegeDescription("AFFILIATE")).toContain("Affiliate privilege");
  });
});
