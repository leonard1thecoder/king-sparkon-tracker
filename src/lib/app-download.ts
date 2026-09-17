// Native app download links — one source of truth for every
// "Download app" button across marketing, landing and dashboard surfaces.
// All teaser buttons scroll to the landing `#download` section; the two
// store buttons there use these URLs. Set them in `.env.local` (and Vercel)
// when the App Store / Google Play listings go live.

export const DOWNLOAD_SECTION_HREF = "/#download";

// Built-in default so the button works even when the env var is missing
// from the deployment environment (NEXT_PUBLIC_* vars bake in at build
// time). Override per-environment via NEXT_PUBLIC_ANDROID_APP_URL.
const DEFAULT_ANDROID_APP_URL =
  "https://raw.githubusercontent.com/leonard1thecoder/king-sparkon-tracker/main/mobile/releases/king-sparkon-tracker-0.1.0-android.apk";

export function appDownloadLinks() {
  const ios = (process.env.NEXT_PUBLIC_IOS_APP_URL ?? "").trim();
  const android = (process.env.NEXT_PUBLIC_ANDROID_APP_URL ?? "").trim() || DEFAULT_ANDROID_APP_URL;
  return {
    ios: ios || DOWNLOAD_SECTION_HREF,
    android,
    configured: Boolean(ios),
  };
}
