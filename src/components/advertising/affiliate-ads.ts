import { hasConsent } from "@/lib/cookies/consent";

export type AffiliateAd = {
  id: string;
  advertiser: string;
  label: string;
  imageUrl: string;
  affiliateUrl: string;
  ctaText: string;
  alt: string;
};

export const AFFILIATE_AD_CONFIG = {
  initialDelayDesktop: 60_000,
  initialDelayMobile: 90_000,
  closeCooldown: 5 * 60_000,
  clickCooldown: 30 * 60_000,
  maxSessionImpressions: 3,
  campaign: "smartbuyglasses",
  advertiser: "SmartBuyGlasses",
} as const;

export const AFFILIATE_STORAGE_KEYS = {
  impressions: "affiliate_ad_impressions",
  lastClosed: "affiliate_ad_last_closed",
  lastClicked: "affiliate_ad_last_clicked",
  lastCreativeId: "affiliate_ad_last_creative",
  lastCampaign: "affiliate_ad_last_campaign",
} as const;

export const SUPPRESSED_ROUTE_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/verify-email",
  "/resend-verification",
] as const;

export function isSuppressedRoute(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  for (const prefix of SUPPRESSED_ROUTE_PREFIXES) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) return true;
  }
  // Cart page suppression – covers /dashboard/user/shop/cart, /dashboard/user/carts, /dashboard/user/uif/cart, any /cart segment
  if (pathname.includes("/cart")) return true;
  // Checkout / payment suppression per spec 17 – do not interrupt checkout flows
  if (pathname.includes("/checkout")) return true;
  if (pathname.includes("/payment")) return true;
  return false;
}

export const SMARTBUYGLASSES_AFFILIATE_URL = "https://tidd.ly/4iwRZRZ";

export const SMARTBUYGLASSES_ADS: AffiliateAd[] = [
  {
    id: "smartbuyglasses-01",
    advertiser: "SmartBuyGlasses",
    label: "Sponsored",
    imageUrl:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/smartbuyglasses/affiliate-ads/smartbuyglasses/smartbuyglasses-01.png",
    affiliateUrl: SMARTBUYGLASSES_AFFILIATE_URL,
    ctaText: "Shop Now",
    alt: "SmartBuyGlasses designer eyeglasses promotion creative 01",
  },
  {
    id: "smartbuyglasses-02",
    advertiser: "SmartBuyGlasses",
    label: "Sponsored",
    imageUrl:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/smartbuyglasses/affiliate-ads/smartbuyglasses/smartbuyglasses-02.png",
    affiliateUrl: SMARTBUYGLASSES_AFFILIATE_URL,
    ctaText: "Shop Now",
    alt: "SmartBuyGlasses designer eyeglasses promotion creative 02",
  },
  {
    id: "smartbuyglasses-03",
    advertiser: "SmartBuyGlasses",
    label: "Sponsored",
    imageUrl:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/smartbuyglasses/affiliate-ads/smartbuyglasses/smartbuyglasses-03.png",
    affiliateUrl: SMARTBUYGLASSES_AFFILIATE_URL,
    ctaText: "Shop Now",
    alt: "SmartBuyGlasses designer eyeglasses promotion creative 03",
  },
  {
    id: "smartbuyglasses-04",
    advertiser: "SmartBuyGlasses",
    label: "Sponsored",
    imageUrl:
      "https://veizbtzugssszhxabzrv.supabase.co/storage/v1/object/public/smartbuyglasses/affiliate-ads/smartbuyglasses/smartbuyglasses-04.png",
    affiliateUrl: SMARTBUYGLASSES_AFFILIATE_URL,
    ctaText: "Shop Now",
    alt: "SmartBuyGlasses designer eyeglasses promotion creative 04",
  },
];

export type AffiliateAdEvent = "affiliate_ad_impression" | "affiliate_ad_close" | "affiliate_ad_click";

export function trackAffiliateEvent(
  event: AffiliateAdEvent,
  props: { advertiser: string; campaign: string; creativeId: string }
): void {
  if (typeof window === "undefined") return;
  try {
    // Consent-gated: never queue measurement events before the visitor
    // grants analytics or marketing consent. Queued dataLayer events would
    // otherwise flush into GA/GTM the moment those libraries load.
    if (!hasConsent("analytics") && !hasConsent("marketing")) return;
    // Prefer existing analytics if present
    const w = window as unknown as Record<string, unknown>;
    const gtag = w.gtag as ((cmd: string, name: string, params: unknown) => void) | undefined;
    if (typeof gtag === "function") {
      gtag("event", event, props);
      return;
    }
    const dataLayer = w.dataLayer as unknown[] | undefined;
    if (Array.isArray(dataLayer)) {
      dataLayer.push({ event, ...props });
      return;
    }
    // Fallback – console for QA / dev visibility (no extra dependency)
    if (process.env.NODE_ENV !== "production") {
      console.debug(`[AffiliateAd] ${event}`, props);
    }
  } catch {
    // analytics must never break UX
  }
}

export function selectNextCreative(excludeId: string | null): AffiliateAd {
  const pool = excludeId ? SMARTBUYGLASSES_ADS.filter((ad) => ad.id !== excludeId) : SMARTBUYGLASSES_ADS;
  const candidates = pool.length > 0 ? pool : SMARTBUYGLASSES_ADS;
  const idx = Math.floor(Math.random() * candidates.length);
  return candidates[idx] ?? SMARTBUYGLASSES_ADS[0];
}
