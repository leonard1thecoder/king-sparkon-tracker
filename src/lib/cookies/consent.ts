/**
 * Client-safe consent helpers: read, write, validate and query the
 * `cookie_consent` persistence cookie.
 *
 * - Works when `document` is unavailable (SSR) by returning safe fallbacks.
 * - Never throws on malformed cookies: unparseable or outdated values are
 *   treated as "no valid consent" instead of crashing.
 * - No `any` anywhere; unknown JSON is narrowed with explicit guards.
 */

import {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_PATH,
  COOKIE_CONSENT_VERSION,
  DEFAULT_CONSENT_STATE,
} from "./constants";
import { COOKIE_CATEGORIES } from "./types";
import type {
  ConsentState,
  CookieCategory,
  OptionalCookieCategory,
  StoredConsent,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate an unknown parsed value into a `StoredConsent`, or return `null`.
 * Rejects wrong shapes, wrong types, and stale policy versions so old
 * consent can never silently authorize new tracking.
 */
export function parseStoredConsent(value: unknown): StoredConsent | null {
  if (!isRecord(value)) return null;
  if (value.necessary !== true) return null;
  if (typeof value.timestamp !== "string" || Number.isNaN(Date.parse(value.timestamp))) return null;
  if (value.version !== COOKIE_CONSENT_VERSION) return null;

  const state: ConsentState = { ...DEFAULT_CONSENT_STATE };
  for (const category of COOKIE_CATEGORIES) {
    if (category === "necessary") continue;
    const flag = value[category];
    if (typeof flag !== "boolean") return null;
    state[category] = flag;
  }
  return { ...state, necessary: true, timestamp: value.timestamp, version: value.version };
}

/** Read the raw `cookie_consent` value from `document.cookie` (null on SSR). */
export function readConsentCookieRaw(): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${COOKIE_CONSENT_NAME}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return null;
}

/** Parse the persisted consent, or `null` when absent/invalid/outdated. */
export function getConsent(): StoredConsent | null {
  const raw = readConsentCookieRaw();
  if (!raw) return null;
  try {
    return parseStoredConsent(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

/** Effective per-category choices: stored consent, or privacy-safe defaults. */
export function getEffectiveConsent(): ConsentState {
  const stored = getConsent();
  if (!stored) return { ...DEFAULT_CONSENT_STATE };
  return {
    necessary: true,
    preferences: stored.preferences,
    analytics: stored.analytics,
    marketing: stored.marketing,
  };
}

/** Convenience check used to gate analytics/marketing integrations. */
export function hasConsent(category: CookieCategory): boolean {
  return getEffectiveConsent()[category];
}

/** Convenience check for any single optional category. */
export function hasOptionalConsent(category: OptionalCookieCategory): boolean {
  return getEffectiveConsent()[category];
}

function buildConsentCookie(record: StoredConsent, maxAge: number): string {
  const attributes = [
    `${COOKIE_CONSENT_NAME}=${encodeURIComponent(JSON.stringify(record))}`,
    `Path=${COOKIE_CONSENT_PATH}`,
    `Max-Age=${maxAge}`,
    "SameSite=Lax",
  ];
  const isHttps =
    (typeof window !== "undefined" && window.location.protocol === "https:") ||
    (typeof process !== "undefined" && process.env.NODE_ENV === "production");
  if (isHttps) attributes.push("Secure");
  return attributes.join("; ");
}

function notifyConsentChanged(consent: StoredConsent | null): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<StoredConsent | null>(COOKIE_CONSENT_EVENT, { detail: consent }));
}

/**
 * Persist a consent record. Single write path — overwrites any previous
 * `cookie_consent` value so duplicates can never accumulate.
 */
export function setConsent(state: ConsentState): StoredConsent {
  const record: StoredConsent = {
    necessary: true,
    preferences: state.preferences,
    analytics: state.analytics,
    marketing: state.marketing,
    timestamp: new Date().toISOString(),
    version: COOKIE_CONSENT_VERSION,
  };
  if (typeof document !== "undefined") {
    document.cookie = buildConsentCookie(record, COOKIE_CONSENT_MAX_AGE);
  }
  notifyConsentChanged(record);
  return record;
}

/** Accept every category (necessary + all optional). */
export function acceptAllConsent(): StoredConsent {
  return setConsent({ necessary: true, preferences: true, analytics: true, marketing: true });
}

/** Keep only strictly necessary cookies (privacy-friendly default). */
export function rejectNonEssentialConsent(): StoredConsent {
  return setConsent({ ...DEFAULT_CONSENT_STATE });
}

/**
 * Delete the consent cookie and notify listeners. The banner returns on
 * next render because no valid consent exists anymore.
 */
export function clearConsent(): void {
  if (typeof document !== "undefined") {
    document.cookie = `${COOKIE_CONSENT_NAME}=; Path=${COOKIE_CONSENT_PATH}; Max-Age=0; SameSite=Lax`;
  }
  notifyConsentChanged(null);
}
