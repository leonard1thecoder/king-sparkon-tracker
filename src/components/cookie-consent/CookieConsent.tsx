"use client";

import type { ReactNode } from "react";
import { ConsentProvider } from "./ConsentProvider";
import { CookieConsentBanner } from "./CookieConsentBanner";
import { CookieSettingsDialog } from "./CookieSettingsDialog";
import { ConsentScripts } from "./ConsentScripts";
import type { StoredConsent } from "@/lib/cookies";

/**
 * One-line integration: consent state, banner, preferences dialog and
 * consent-gated third-party scripts.
 *
 * ```tsx
 * // app/layout.tsx (inside <body>)
 * <CookieConsent initialConsent={await getServerConsent()}>
 *   {children}
 * </CookieConsent>
 * ```
 *
 * Prefer the individual pieces (`ConsentProvider`, `CookieConsentBanner`,
 * `CookieSettingsDialog`, `ConsentScripts`) when you need custom placement.
 */
export function CookieConsent({
  initialConsent = null,
  children,
}: {
  initialConsent?: StoredConsent | null;
  children?: ReactNode;
}) {
  return (
    <ConsentProvider initialConsent={initialConsent}>
      {children}
      <CookieConsentBanner />
      <CookieSettingsDialog />
      <ConsentScripts />
    </ConsentProvider>
  );
}
