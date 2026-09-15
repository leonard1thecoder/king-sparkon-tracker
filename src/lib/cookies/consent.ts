/**
 * Framework-independent consent helpers: read, write, validate and query
 * the `cookie_consent` persistence cookie.
 *
 * - Safe to import from server AND client code: every browser API access
 *   is guarded, and the module has no React dependency.
 * - Never throws on malformed cookies: unparseable, outdated or wrongly
 *   shaped values resolve to "no valid consent" instead of crashing.
 * - One central serialization/write path shared by persist + removal, so
 *   duplicate consent cookies can never accumulate.
 * - No `any` anywhere; unknown JSON is narrowed with explicit guards.
 */

import {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_PATH,
  COOKIE_CONSENT_SYNC_KEY,
  COOKIE_CONSENT_VERSION,
  DEFAULT_CONSENT_STATE,
} from "./constants";
import { COOKIE_CATEGORIES } from "./types";
import type {
  ConsentState,
  ConsentStatus,
  CookieCategory,
  OptionalCookieCategory,
  StoredConsent,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Validate an unknown parsed value into a `StoredConsent`, or return `null`.
 * Rejects wrong shapes, non-boolean categories, invalid timestamps and
 * stale policy versions, so old or forged consent can never silently
 * authorize tracking.
 */
export function parseStoredConsent(value: unknown): StoredConsent | null {
  if (!isRecord(value)) return null;
  if (value.necessary !== true) return null;
  if (typeof value.timestamp !== "string" || Number.isNaN(Date.parse(value.timestamp))) return null;
  if (value.version !== COOKIE_CONSENT_VERSION) return null;

  const state: ConsentState = { ...DEFAULT_CONSENT_STATE };
  for (const category of COOKIE_CATEGORIES) {
    if (category === "necessary") continue;
    const flag: unknown = value[category];
    if (typeof flag !== "boolean") return null;
    state[category] = flag;
  }
  return { ...state, necessary: true, timestamp: value.timestamp, version: value.version };
}

/**
 * Map a stored record (or its absence) to lifecycle status:
 * unknown (prompt) / accepted (all on) / rejected (necessary only) / custom.
 */
export function deriveConsentStatus(stored: StoredConsent | null): ConsentStatus {
  if (!stored) return "unknown";
  const optional = [stored.preferences, stored.analytics, stored.marketing];
  if (optional.every(Boolean)) return "accepted";
  if (optional.every((enabled) => !enabled)) return "rejected";
  return "custom";
}

/** Read the raw `cookie_consent` value. Null on the server or when absent. */
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

/**
 * Category check used to gate integrations.
 * - `necessary` is `true` whenever a valid consent object exists.
 * - Optional categories match their stored boolean.
 * - Missing/invalid consent is never treated as permission (all `false`).
 */
export function hasConsent(category: CookieCategory): boolean {
  const stored = getConsent();
  if (!stored) return false;
  return stored[category] === true;
}

/** Convenience check for any single optional category. */
export function hasOptionalConsent(category: OptionalCookieCategory): boolean {
  return hasConsent(category);
}

/**
 * Central cookie serialization. Both persisting and removal go through
 * here — one format, one path, one cookie.
 */
function toConsentCookieString(encodedValue: string, maxAge: number): string {
  const attributes = [
    `${COOKIE_CONSENT_NAME}=${encodedValue}`,
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

function writeConsentCookie(encodedValue: string, maxAge: number): void {
  if (typeof document === "undefined") return;
  document.cookie = toConsentCookieString(encodedValue, maxAge);
}

function notifyConsentChanged(consent: StoredConsent | null): void {
  if (typeof window === "undefined") return;
  // 1. Same-tab notification (rich detail is safe here: same page already owns it).
  window.dispatchEvent(new CustomEvent<StoredConsent | null>(COOKIE_CONSENT_CHANGE_EVENT, { detail: consent }));
  // 2. Cross-tab ping: timestamp ONLY — never the consent object (privacy).
  try {
    const storage = window.localStorage;
    if (storage) storage.setItem(COOKIE_CONSENT_SYNC_KEY, String(Date.now()));
  } catch {
    // Private mode / disabled storage: other tabs simply re-prompt on load.
  }
}

/**
 * Persist a consent record. Overwrites any previous value in place so
 * duplicates can never accumulate.
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
  writeConsentCookie(encodeURIComponent(JSON.stringify(record)), COOKIE_CONSENT_MAX_AGE);
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
 * Delete the consent cookie through the same central path and notify
 * listeners. The banner returns on next render because no valid consent
 * exists anymore.
 */
export function clearConsent(): void {
  writeConsentCookie("", 0);
  notifyConsentChanged(null);
}
