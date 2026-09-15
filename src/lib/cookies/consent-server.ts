import { cookies } from "next/headers";
import { COOKIE_CONSENT_NAME } from "./constants";
import { parseStoredConsent } from "./consent";
import type { StoredConsent } from "./types";

/**
 * Server-side consent read for Server Components, Route Handlers and
 * Server Actions. Returns the validated stored record, or `null` when the
 * visitor has not consented, the cookie is malformed, or the policy
 * version has moved on.
 *
 * Never throws: every failure mode resolves to `null` (no consent).
 */
export async function getServerConsent(): Promise<StoredConsent | null> {
  try {
    const store = await cookies();
    const raw = store.get(COOKIE_CONSENT_NAME)?.value;
    if (!raw) return null;
    return parseStoredConsent(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}
