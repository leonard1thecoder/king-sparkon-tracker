"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useConsent } from "./ConsentProvider";
import type { CookieCategory } from "@/lib/cookies";

/**
 * Render `children` only when the given category is granted.
 * Nothing renders on the server or before client hydration, so gated
 * content (iframes, embeds, custom trackers) can never fire pre-consent.
 *
 * Example:
 *
 * ```tsx
 * <ConsentGate category="analytics">
 *   <CustomHeatmapEmbed />
 * </ConsentGate>
 * ```
 */
export function ConsentGate({ category, children }: { category: CookieCategory; children: ReactNode }) {
  const { hasCategory, status } = useConsent();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || status !== "decided" || !hasCategory(category)) return null;
  return <>{children}</>;
}
