"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { useCookieConsent } from "./ConsentProvider";
import type { ConsentState } from "@/lib/cookies/types";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "ca-pub-8918343184695576";

type GtagFn = (...args: Array<string | Date | Record<string, string | boolean>>) => void;

interface GtagWindow {
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: unknown;
}

function pushConsentUpdate(consent: ConsentState): void {
  const scope = window as unknown as GtagWindow;
  if (!Array.isArray(scope.dataLayer)) return;
  // Keep Google tags in sync when consent is granted, customized or withdrawn.
  if (typeof scope.gtag === "function") {
    (scope.gtag as GtagFn)("consent", "update", {
      ad_storage: consent.marketing ? "granted" : "denied",
      ad_user_data: consent.marketing ? "granted" : "denied",
      ad_personalization: consent.marketing ? "granted" : "denied",
      analytics_storage: consent.analytics ? "granted" : "denied",
      functionality_storage: consent.preferences ? "granted" : "denied",
      personalization_storage: consent.preferences ? "granted" : "denied",
    });
  }
  scope.dataLayer.push({
    event: "cookie_consent_update",
    analytics: consent.analytics,
    marketing: consent.marketing,
  });
}

type IntegrationLifecycle = "never" | "active" | "retired";

/**
 * Module-level lifecycle per vendor integration. Survives React re-renders,
 * StrictMode double-mounts, route navigations (root layout persists) and
 * consent toggles within one page lifecycle:
 * - `never` → first grant injects the loader, exactly once.
 * - `active` → revoke unmounts the loader element.
 * - `retired` → re-grant does NOT re-inject (vendor runtime persists in
 *   memory; only a Consent Mode update is pushed). Already-downloaded
 *   vendor JavaScript can never be un-downloaded without a page reload,
 *   and re-injecting would create duplicate GA/GTM/Pixel instances.
 */
const integrationLifecycles = new Map<string, IntegrationLifecycle>();

function useIntegrationLifecycle(key: string, enabled: boolean): boolean {
  const [renderLoader, setRenderLoader] = useState(false);

  useEffect(() => {
    const current = integrationLifecycles.get(key) ?? "never";
    if (enabled && current === "never") {
      integrationLifecycles.set(key, "active");
      setRenderLoader(true);
    } else if (!enabled && current === "active") {
      integrationLifecycles.set(key, "retired");
      setRenderLoader(false);
    }
  }, [enabled, key]);

  return renderLoader;
}

/** One-way latch for initialization commands (gtag config, pixel init). */
const firedInitializations = new Set<string>();

function fireInitializationOnce(key: string, initialize: () => void): void {
  if (firedInitializations.has(key)) return;
  firedInitializations.add(key);
  initialize();
}

/**
 * Google Consent Mode v2 defaults. Always rendered (tiny, no tracking):
 * every storage type starts denied until the visitor grants the matching
 * category, at which point a `consent update` is pushed.
 */
function GoogleConsentDefaults() {
  return (
    <script
      id="king-sparkon-consent-defaults"
      dangerouslySetInnerHTML={{
        __html: `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',functionality_storage:'denied',personalization_storage:'denied',security_storage:'granted'});`,
      }}
    />
  );
}

/** Google Analytics 4 library. Mounted once, only after `analytics` consent. */
function GoogleAnalyticsLibrary({ measurementId }: { measurementId: string }) {
  return (
    <Script
      id="king-sparkon-ga-src"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
    />
  );
}

/** Google Tag Manager container. Injected once, only after `marketing` consent. */
function GoogleTagManager({ containerId }: { containerId: string }) {
  return (
    <>
      <Script id="king-sparkon-gtm-src" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${containerId}');`}
      </Script>
      <noscript>
        <iframe
          title="Google Tag Manager"
          src={`https://www.googletagmanager.com/ns.html?id=${containerId}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}

/** Meta Pixel. Injected once, only after `marketing` consent and a pixel ID. */
function MetaPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script id="king-sparkon-meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
    </Script>
  );
}

/**
 * Google AdSense library. Mounted once, only after `marketing` consent.
 * (Previously hardcoded in the root layout head — now consent-gated.)
 */
function AdSense({ publisherId }: { publisherId: string }) {
  return (
    <Script
      id="king-sparkon-adsense"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${publisherId}`}
      strategy="afterInteractive"
      crossOrigin="anonymous"
    />
  );
}

/**
 * Consent-aware third-party script loading.
 *
 * Nothing optional renders until the matching category is granted, so no
 * analytics/marketing request can fire pre-consent — including on the
 * very first visit, because every optional category defaults to `false`.
 *
 * Each integration additionally requires its `NEXT_PUBLIC_*` id; unset
 * ids render nothing (Meta Pixel stays fully disabled while its ID is
 * empty, even with Marketing consent granted).
 */
export function ConsentScripts() {
  const { consent, status } = useCookieConsent();
  const decided = status !== "unknown";

  const analyticsGranted = decided && consent.analytics && GA_MEASUREMENT_ID !== "";
  const marketingGranted = decided && consent.marketing;

  const mountGaLibrary = useIntegrationLifecycle("ga-library", analyticsGranted);
  const mountGtm = useIntegrationLifecycle("gtm", marketingGranted && GTM_ID !== "");
  const mountPixel = useIntegrationLifecycle("meta-pixel", marketingGranted && META_PIXEL_ID !== "");
  const mountAdsense = useIntegrationLifecycle("adsense", marketingGranted);

  // Keep Consent Mode in sync on every decided change (grant AND withdraw).
  // Only the categories the visitor authorized are ever granted.
  useEffect(() => {
    if (!decided) return;
    pushConsentUpdate(consent);
  }, [decided, consent]);

  // GA4 initialization exactly once per measurement ID: library load is
  // queued through dataLayer, so ordering with the script fetch is safe.
  useEffect(() => {
    if (!mountGaLibrary || GA_MEASUREMENT_ID === "") return;
    fireInitializationOnce(`ga-config:${GA_MEASUREMENT_ID}`, () => {
      const scope = window as unknown as GtagWindow;
      if (typeof scope.gtag !== "function") return;
      (scope.gtag as GtagFn)("js", new Date());
      (scope.gtag as GtagFn)("consent", "update", { analytics_storage: "granted" });
      (scope.gtag as GtagFn)("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
    });
  }, [mountGaLibrary]);

  if (!decided) {
    // Pre-decision: only Consent Mode defaults (no measurement).
    return <GoogleConsentDefaults />;
  }
  return (
    <>
      <GoogleConsentDefaults />
      {mountGaLibrary && GA_MEASUREMENT_ID !== "" ? <GoogleAnalyticsLibrary measurementId={GA_MEASUREMENT_ID} /> : null}
      {mountGtm && GTM_ID !== "" ? <GoogleTagManager containerId={GTM_ID} /> : null}
      {mountPixel && META_PIXEL_ID !== "" ? <MetaPixel pixelId={META_PIXEL_ID} /> : null}
      {mountAdsense ? <AdSense publisherId={ADSENSE_PUBLISHER_ID} /> : null}
    </>
  );
}
