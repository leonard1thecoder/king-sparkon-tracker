// OAuth login helpers — pure functions (no native imports) so they stay
// unit-testable. Mirrors web `src/lib/auth/oauth.ts` copy and codes.

export type OAuthProviderId = "google" | "facebook" | "x" | "tiktok";

export type OAuthProviderStatus = {
  id: string;
  displayName: string;
  enabled: boolean;
};

export const OAUTH_PROVIDERS: ReadonlyArray<{ id: OAuthProviderId; displayName: string }> = [
  { id: "google", displayName: "Google" },
  { id: "facebook", displayName: "Facebook" },
  { id: "x", displayName: "X" },
  { id: "tiktok", displayName: "TikTok" },
];

// Deep link registered in app.json (`scheme: kingsparkon`) and allowlisted
// server-side via OAUTH_MOBILE_REDIRECT_URIS.
export function oauthRedirectUri() {
  return "kingsparkon://(auth)/oauth-callback";
}

export function oauthAuthorizeUrl(backendBaseUrl: string, provider: OAuthProviderId) {
  const base = backendBaseUrl.replace(/\/$/, "");
  return `${base}/api/auth/oauth/authorize/${provider}?redirect_uri=${encodeURIComponent(oauthRedirectUri())}`;
}

export function parseOAuthCallbackUrl(url: string | null | undefined): { code?: string; error?: string } | null {
  if (!url) return null;
  const queryIndex = url.indexOf("?");
  if (queryIndex < 0) return null;
  const params = parseQuery(url.slice(queryIndex + 1));
  if (params.code) return { code: params.code };
  if (params.error) return { error: params.error };
  return null;
}

function parseQuery(query: string): Record<string, string> {
  const params: Record<string, string> = {};
  for (const pair of query.split("&")) {
    if (!pair) continue;
    const separator = pair.indexOf("=");
    const rawKey = separator < 0 ? pair : pair.slice(0, separator);
    const rawValue = separator < 0 ? "" : pair.slice(separator + 1);
    try {
      params[decodeURIComponent(rawKey)] = decodeURIComponent(rawValue.replace(/\+/g, " "));
    } catch {
      continue;
    }
  }
  return params;
}

export function oauthErrorMessage(code: string | null | undefined): string | null {
  switch (code) {
    case "access_denied":
      return "The sign-in was cancelled at the provider. Try again when ready.";
    case "missing_email":
      return "That provider did not share an email address, so the account cannot be created. Use email sign-in or try another provider.";
    case "unverified_email":
      return "That email is already registered with an unverified address. Sign in with your password first, then link the provider from your profile.";
    case "account_exists":
      return "An account conflict stopped the sign-in. Sign in with your original method and try again.";
    case "unsupported_provider":
      return "That sign-in provider is not supported.";
    case "provider_error":
      return "The provider sign-in failed. Check the connection and try again.";
    case "exchange_failed":
      return "The sign-in session expired before it could be completed. Start the provider sign-in again.";
    default:
      return null;
  }
}
