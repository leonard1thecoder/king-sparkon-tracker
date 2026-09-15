import { describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { COOKIE_CONSENT_VERSION } from "./constants";
import { getServerConsent } from "./consent-server";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));

const mockCookies = vi.mocked(cookies);

function consentValue(payload: unknown): string {
  return encodeURIComponent(JSON.stringify(payload));
}

describe("getServerConsent", () => {
  it("returns the validated record for a current-version cookie", async () => {
    mockCookies.mockResolvedValue({
      get: () => ({
        value: consentValue({
          necessary: true,
          preferences: false,
          analytics: true,
          marketing: false,
          timestamp: "2026-09-15T16:00:00.000Z",
          version: COOKIE_CONSENT_VERSION,
        }),
      }),
    } as unknown as Awaited<ReturnType<typeof cookies>>);
    await expect(getServerConsent()).resolves.toMatchObject({ analytics: true, version: COOKIE_CONSENT_VERSION });
  });

  it("returns null when the cookie is absent", async () => {
    mockCookies.mockResolvedValue({ get: () => undefined } as unknown as Awaited<ReturnType<typeof cookies>>);
    await expect(getServerConsent()).resolves.toBeNull();
  });

  it("returns null for malformed or stale server cookies without throwing", async () => {
    for (const value of [
      "not-json",
      consentValue({ necessary: true }),
      consentValue({
        necessary: true,
        preferences: false,
        analytics: "true",
        marketing: false,
        timestamp: "2026-09-15T16:00:00.000Z",
        version: COOKIE_CONSENT_VERSION,
      }),
      consentValue({
        necessary: true,
        preferences: false,
        analytics: false,
        marketing: false,
        timestamp: "2026-09-15T16:00:00.000Z",
        version: COOKIE_CONSENT_VERSION - 1,
      }),
    ]) {
      mockCookies.mockResolvedValue({
        get: () => ({ value }),
      } as unknown as Awaited<ReturnType<typeof cookies>>);
      await expect(getServerConsent()).resolves.toBeNull();
    }
  });
});
