// Native app download links — one source of truth for every
// "Download app" button across marketing, landing and dashboard surfaces.
// All teaser buttons scroll to the landing `#download` section; the two
// store buttons there use these URLs. Set them in `.env.local` (and Vercel)
// when the App Store / Google Play listings go live.

export const DOWNLOAD_SECTION_HREF = "/#download";

export function appDownloadLinks() {
  const ios = (process.env.NEXT_PUBLIC_IOS_APP_URL ?? "").trim();
  const android = (process.env.NEXT_PUBLIC_ANDROID_APP_URL ?? "").trim();
  return {
    ios: ios || DOWNLOAD_SECTION_HREF,
    android: android || DOWNLOAD_SECTION_HREF,
    configured: Boolean(ios && android),
  };
}
