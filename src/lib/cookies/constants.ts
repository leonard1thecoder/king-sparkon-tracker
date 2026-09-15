import type { ConsentState, CookieCategory, OptionalCookieCategory } from "./types";

/**
 * Bump this integer whenever the cookie policy changes in a way that
 * requires visitors to review their choice again. Stored consent records
 * with an older `version` are treated as undecided and the banner returns.
 */
export const COOKIE_CONSENT_VERSION = 1;

/** Name of the persistence cookie. There must only ever be one of these. */
export const COOKIE_CONSENT_NAME = "cookie_consent";

/** One year. The browser deletes the cookie afterwards, re-prompting. */
export const COOKIE_CONSENT_MAX_AGE = 60 * 60 * 24 * 365;

/** Site-wide path so every route (and the footer button) sees one choice. */
export const COOKIE_CONSENT_PATH = "/";

/**
 * Privacy-friendly defaults: nothing optional is assumed.
 * `necessary` is always true and is never user-editable.
 */
export const DEFAULT_CONSENT_STATE: ConsentState = {
  necessary: true,
  preferences: false,
  analytics: false,
  marketing: false,
};

/** Optional categories a visitor can toggle in Cookie Settings. */
export const OPTIONAL_CATEGORIES: readonly OptionalCookieCategory[] = [
  "preferences",
  "analytics",
  "marketing",
] as const;

export interface CookieCategoryInfo {
  key: CookieCategory;
  title: string;
  description: string;
  locked: boolean;
}

/**
 * Plain-language category explanations suitable for a South African
 * website. Neutral wording, no dark patterns, and no absolute legal
 * claims: necessary cookies are clearly distinguished as always-on,
 * optional categories are described factually.
 */
export const COOKIE_CATEGORY_INFO: readonly CookieCategoryInfo[] = [
  {
    key: "necessary",
    title: "Necessary cookies",
    description:
      "Required for core functionality, security, authentication and essential site operation, such as keeping you signed in and protecting forms. The site cannot work without these, so they are always on.",
    locked: true,
  },
  {
    key: "preferences",
    title: "Preferences cookies",
    description:
      "Remember choices you make, such as language, region or display preferences, so you do not have to set them on every visit.",
    locked: false,
  },
  {
    key: "analytics",
    title: "Analytics cookies",
    description:
      "Help us understand, in aggregate, how visitors use the site so we can fix problems and improve content.",
    locked: false,
  },
  {
    key: "marketing",
    title: "Marketing cookies",
    description:
      "Used for advertising, campaign measurement and related integrations, for example Google AdSense. No advertising cookies are set unless you allow them.",
    locked: false,
  },
] as const;

/** Same-tab notification fired on `window` whenever consent is written/cleared. */
export const COOKIE_CONSENT_CHANGE_EVENT = "cookie-consent-change";

/**
 * Cross-tab notification key. The value is only a timestamp ping — the
 * complete consent object is NEVER stored in localStorage. The cookie
 * remains the single source of truth; tabs re-read it on notification.
 */
export const COOKIE_CONSENT_SYNC_KEY = "cookie-consent-sync";
