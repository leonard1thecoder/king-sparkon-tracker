import { beforeEach, describe, expect, it, vi } from "vitest";
import { COOKIE_CONSENT_SYNC_KEY, COOKIE_CONSENT_VERSION } from "./constants";
import {
  acceptAllConsent,
  clearConsent,
  deriveConsentStatus,
  getConsent,
  hasConsent,
  parseStoredConsent,
  rejectNonEssentialConsent,
  setConsent,
} from "./consent";
import type { StoredConsent } from "./types";

function validRecord(overrides: Partial<StoredConsent> = {}): StoredConsent {
  return {
    necessary: true,
    preferences: false,
    analytics: true,
    marketing: false,
    timestamp: "2026-09-15T16:00:00.000Z",
    version: COOKIE_CONSENT_VERSION,
    ...overrides,
  };
}

/** Minimal document.cookie jar for testing the single write path. */
function stubDocumentCookie(initial = "") {
  let jar = initial;
  vi.stubGlobal("document", {});
  Object.defineProperty(globalThis.document, "cookie", {
    configurable: true,
    get: () => jar,
    set: (value: string) => {
      // Emulate browser semantics: assignment sets one cookie by name.
      const pair = value.split(";")[0] ?? "";
      const equals = pair.indexOf("=");
      const name = pair.slice(0, equals).trim();
      const encoded = pair.slice(equals + 1).trim();
      const maxAgeMatch = /Max-Age=(\d+)/i.exec(value);
      const existing = jar
        .split(";")
        .map((part) => part.trim())
        .filter((part) => part && !part.startsWith(`${name}=`));
      if (!maxAgeMatch || Number(maxAgeMatch[1]) > 0) {
        existing.push(`${name}=${encoded}`);
      }
      jar = existing.join("; ");
    },
  });
  return () => jar;
}

function stubWindow() {
  const setItem = vi.fn();
  const dispatchEvent = vi.fn();
  vi.stubGlobal("window", {
    location: { protocol: "http:" },
    dispatchEvent,
    localStorage: { setItem, getItem: vi.fn(), removeItem: vi.fn() },
  });
  return { setItem, dispatchEvent };
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

describe("parseStoredConsent", () => {
  it("accepts a valid current-version record", () => {
    expect(parseStoredConsent(validRecord())).toEqual(validRecord());
  });

  it.each([null, undefined, 42, "consent", [], true])("rejects non-object %p", (value) => {
    expect(parseStoredConsent(value)).toBeNull();
  });

  it("rejects missing properties", () => {
    const partial: Record<string, unknown> = { ...validRecord() };
    delete partial.analytics;
    expect(parseStoredConsent(partial)).toBeNull();
  });

  it("rejects non-boolean category values", () => {
    expect(parseStoredConsent(validRecord({ analytics: "true" as unknown as boolean }))).toBeNull();
    expect(parseStoredConsent(validRecord({ marketing: 1 as unknown as boolean }))).toBeNull();
    expect(parseStoredConsent(validRecord({ preferences: null as unknown as boolean }))).toBeNull();
  });

  it("rejects missing or invalid timestamps", () => {
    const missing: Record<string, unknown> = { ...validRecord() };
    delete missing.timestamp;
    expect(parseStoredConsent(missing)).toBeNull();
    expect(parseStoredConsent(validRecord({ timestamp: "not-a-date" }))).toBeNull();
    expect(parseStoredConsent(validRecord({ timestamp: "" }))).toBeNull();
  });

  it("rejects stale or wrong versions", () => {
    expect(parseStoredConsent(validRecord({ version: COOKIE_CONSENT_VERSION - 1 }))).toBeNull();
    expect(parseStoredConsent(validRecord({ version: COOKIE_CONSENT_VERSION + 1 }))).toBeNull();
    const missing: Record<string, unknown> = { ...validRecord() };
    delete missing.version;
    expect(parseStoredConsent(missing)).toBeNull();
  });

  it("rejects necessary !== true", () => {
    expect(parseStoredConsent(validRecord({ necessary: false }))).toBeNull();
  });
});

describe("deriveConsentStatus", () => {
  it("maps absence to unknown", () => {
    expect(deriveConsentStatus(null)).toBe("unknown");
  });

  it("maps all-optional-on to accepted", () => {
    expect(
      deriveConsentStatus(validRecord({ preferences: true, analytics: true, marketing: true })),
    ).toBe("accepted");
  });

  it("maps necessary-only to rejected", () => {
    expect(deriveConsentStatus(validRecord())).toBe("rejected");
  });

  it("maps mixed choices to custom", () => {
    expect(deriveConsentStatus(validRecord({ analytics: true }))).toBe("custom");
    expect(
      deriveConsentStatus(validRecord({ preferences: true, analytics: true, marketing: false })),
    ).toBe("custom");
  });
});

describe("accept/reject/clear", () => {
  it("acceptAllConsent enables every category with current version", () => {
    stubDocumentCookie();
    stubWindow();
    const record = acceptAllConsent();
    expect(record).toMatchObject({
      necessary: true,
      preferences: true,
      analytics: true,
      marketing: true,
      version: COOKIE_CONSENT_VERSION,
    });
    expect(Number.isNaN(Date.parse(record.timestamp))).toBe(false);
  });

  it("rejectNonEssentialConsent keeps only necessary enabled", () => {
    stubDocumentCookie();
    stubWindow();
    expect(rejectNonEssentialConsent()).toMatchObject({
      necessary: true,
      preferences: false,
      analytics: false,
      marketing: false,
    });
  });

  it("round-trips through a single cookie_consent cookie", () => {
    const readJar = stubDocumentCookie();
    stubWindow();
    acceptAllConsent();
    expect(getConsent()).toMatchObject({ necessary: true, analytics: true });
    // Exactly one consent cookie, never duplicates.
    const names = readJar()
      .split(";")
      .map((part) => part.trim().split("=")[0]);
    expect(names.filter((name) => name === "cookie_consent")).toHaveLength(1);
  });

  it("clearConsent removes the cookie through the central path", () => {
    const readJar = stubDocumentCookie();
    stubWindow();
    acceptAllConsent();
    expect(getConsent()).not.toBeNull();
    clearConsent();
    expect(getConsent()).toBeNull();
    expect(readJar()).not.toContain("cookie_consent=");
  });

  it("treats malformed cookie values as no consent", () => {
    stubDocumentCookie("cookie_consent=not-json-at-all");
    expect(getConsent()).toBeNull();
    stubDocumentCookie("cookie_consent=%7B%22necessary%22%3Atrue%7D");
    expect(getConsent()).toBeNull();
  });
});

describe("hasConsent", () => {
  it("never treats missing consent as permission", () => {
    stubDocumentCookie();
    expect(hasConsent("necessary")).toBe(false);
    expect(hasConsent("analytics")).toBe(false);
    expect(hasConsent("marketing")).toBe(false);
    expect(hasConsent("preferences")).toBe(false);
  });

  it("returns true for necessary when a valid object exists", () => {
    const readJar = stubDocumentCookie();
    void readJar;
    stubWindow();
    rejectNonEssentialConsent();
    expect(hasConsent("necessary")).toBe(true);
    expect(hasConsent("analytics")).toBe(false);
  });

  it("matches stored booleans for optional categories", () => {
    stubDocumentCookie();
    stubWindow();
    setConsent({ necessary: true, preferences: true, analytics: false, marketing: true });
    expect(hasConsent("preferences")).toBe(true);
    expect(hasConsent("analytics")).toBe(false);
    expect(hasConsent("marketing")).toBe(true);
  });
});

describe("cross-tab notification", () => {
  it("pings localStorage with a timestamp, never the consent object", () => {
    stubDocumentCookie();
    const { setItem } = stubWindow();
    const record = acceptAllConsent();
    expect(setItem).toHaveBeenCalledWith(COOKIE_CONSENT_SYNC_KEY, expect.any(String));
    const pinged = setItem.mock.calls[0]?.[1] as string;
    expect(Number.isNaN(Number(pinged))).toBe(false);
    expect(pinged).not.toContain(JSON.stringify(record));
  });

  it("survives unavailable localStorage", () => {
    stubDocumentCookie();
    vi.stubGlobal("window", {
      location: { protocol: "http:" },
      dispatchEvent: vi.fn(),
      get localStorage(): never {
        throw new Error("denied");
      },
    });
    expect(() => acceptAllConsent()).not.toThrow();
  });
});
