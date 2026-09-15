/**
 * Public API of the cookie consent system.
 *
 * Client components: import from `@/lib/cookies` (never import
 * `consent-server` — `next/headers` only works on the server).
 * Server components / route handlers: import `getServerConsent` from
 * `@/lib/cookies/consent-server`.
 */
export {
  acceptAllConsent,
  clearConsent,
  getConsent,
  getEffectiveConsent,
  hasConsent,
  hasOptionalConsent,
  parseStoredConsent,
  readConsentCookieRaw,
  rejectNonEssentialConsent,
  setConsent,
} from "./consent";
export {
  COOKIE_CONSENT_EVENT,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_PATH,
  COOKIE_CONSENT_VERSION,
  COOKIE_CATEGORY_INFO,
  DEFAULT_CONSENT_STATE,
  OPTIONAL_CATEGORIES,
} from "./constants";
export type {
  ConsentState,
  ConsentStatus,
  CookieCategory,
  OptionalCookieCategory,
  StoredConsent,
} from "./types";
export { COOKIE_CATEGORIES } from "./types";
export type { CookieCategoryInfo } from "./constants";
