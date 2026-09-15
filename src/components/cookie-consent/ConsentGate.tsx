"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useCookieConsent } from "./ConsentProvider";
import type { CookieCategory } from "@/lib/cookies/types";

/**
 * Render `children` only when the requested category has consent.
 * Nothing renders on the server, before hydration, or while consent is
 * unknown — so gated content (iframes, embeds, custom trackers) can
 * never fire pre-consent.
 *
 * Example:
 *
 * ```tsx
 * <ConsentGate category="marketing">
 *   <SomeThirdPartyWidget />
 * </ConsentGate>
 * ```
 *
 * It must never grant consent itself.
 */
export function ConsentGate({ category, children }: { category: CookieCategory; children: ReactNode }) {
  const { hasConsent, status } = useCookieConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status === "unknown" || !hasConsent(category)) return null;
  return <>{children}</>;
}
