/**
 * Shared TypeScript types for the cookie consent system.
 *
 * The consent model is intentionally small and serializable so it can be
 * stored in a cookie, read on the server via `next/headers`, and passed
 * from Server Components to Client Components without issues.
 */

/** Optional (non-necessary) cookie categories the user can toggle. */
export type OptionalCookieCategory = "preferences" | "analytics" | "marketing";

/** Every cookie category tracked by the consent system. */
export type CookieCategory = "necessary" | OptionalCookieCategory;

/** Per-category on/off choices. `necessary` is always `true`. */
export type ConsentState = Record<CookieCategory, boolean>;

/**
 * Structured consent record persisted in the `cookie_consent` cookie.
 * Never store a bare boolean — the shape below lets support and audit
 * tooling answer *what* was consented to, *when*, and under *which policy*.
 */
export interface StoredConsent extends ConsentState {
  /** ISO-8601 timestamp of when the choice was recorded. */
  timestamp: string;
  /** Policy version from `COOKIE_CONSENT_VERSION` at record time. */
  version: number;
}

/** All known category keys, useful for iteration and validation. */
export const COOKIE_CATEGORIES: readonly CookieCategory[] = [
  "necessary",
  "preferences",
  "analytics",
  "marketing",
] as const;

/** Status of the visitor's consent journey (client-side). */
export type ConsentStatus = "pending" | "undecided" | "decided";
