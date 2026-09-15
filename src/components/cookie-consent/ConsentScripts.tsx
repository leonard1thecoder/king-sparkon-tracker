"use client";

import Script from "next/script";
import { useConsent } from "./ConsentProvider";

const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID ?? "";
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
const ADSENSE_PUBLISHER_ID =
  process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID ?? "ca-pub-8918343184695576";

/**
 * Google Consent Mode v2 defaults. Always rendered (tiny, no tracking):
 * every storage type starts denied until the visitor grants the matching
 * category, at which point the loaders below push a `consent update`.
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

/** Google Analytics 4. Mounted only after `analytics` consent. */
function GoogleAnalytics({ measurementId }: { measurementId: string }) {
  return (
    <>
      <Script
        id="king-sparkon-ga-src"
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="king-sparkon-ga-config" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments);}gtag('js',new Date());gtag('consent','update',{analytics_storage:'granted'});gtag('config','${measurementId}',{anonymize_ip:true});`}
      </Script>
    </>
  );
}

/** Google Tag Manager. Mounted only after `marketing` consent. */
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

/** Meta Pixel. Mounted only after `marketing` consent. */
function MetaPixel({ pixelId }: { pixelId: string }) {
  return (
    <Script id="king-sparkon-meta-pixel" strategy="afterInteractive">
      {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
    </Script>
  );
}

/**
 * Google AdSense. Mounted only after `marketing` consent.
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
 * Nothing below renders until the matching category is granted, so no
 * analytics/marketing request can fire pre-consent — including on the
 * very first visit, because the provider defaults every optional
 * category to `false` until a choice is stored.
 *
 * Each integration additionally requires its `NEXT_PUBLIC_*` id; unset
 * ids render nothing (safe by default in development).
 */
export function ConsentScripts() {
  const { consent, status } = useConsent();
  if (status !== "decided") {
    // Pre-decision: only Consent Mode defaults (no measurement).
    return <GoogleConsentDefaults />;
  }
  return (
    <>
      <GoogleConsentDefaults />
      {consent.analytics && GA_MEASUREMENT_ID ? <GoogleAnalytics measurementId={GA_MEASUREMENT_ID} /> : null}
      {consent.marketing && GTM_ID ? <GoogleTagManager containerId={GTM_ID} /> : null}
      {consent.marketing && META_PIXEL_ID ? <MetaPixel pixelId={META_PIXEL_ID} /> : null}
      {consent.marketing ? <AdSense publisherId={ADSENSE_PUBLISHER_ID} /> : null}
    </>
  );
}
