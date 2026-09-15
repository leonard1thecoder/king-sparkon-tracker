/**
 * Public API of the cookie consent system.
 *
 * IMPORTANT: this barrel re-exports `getServerConsent`, which imports
 * `next/headers`. Client Components must therefore import from the deep
 * paths (`@/lib/cookies/consent`, `@/lib/cookies/constants`,
 * `@/lib/cookies/types`) instead of this barrel — importing `next/headers`
 * into a client bundle is a build error. Server code may use either.
 */
export {
  acceptAllConsent,
  clearConsent,
  deriveConsentStatus,
  getConsent,
  getEffectiveConsent,
  hasConsent,
  hasOptionalConsent,
  parseStoredConsent,
  readConsentCookieRaw,
  rejectNonEssentialConsent,
  setConsent,
} from "./consent";
export { getServerConsent } from "./consent-server";
export {
  COOKIE_CONSENT_CHANGE_EVENT,
  COOKIE_CONSENT_MAX_AGE,
  COOKIE_CONSENT_NAME,
  COOKIE_CONSENT_PATH,
  COOKIE_CONSENT_SYNC_KEY,
  COOKIE_CONSENT_VERSION,
  COOKIE_CATEGORY_INFO,
  DEFAULT_CONSENT_STATE,
  OPTIONAL_CATEGORIES,
} from "./constants";
export { COOKIE_CATEGORIES } from "./types";
export type {
  ConsentState,
  ConsentStatus,
  CookieCategory,
  OptionalCookieCategory,
  StoredConsent,
} from "./types";
export type { CookieCategoryInfo } from "./constants";
