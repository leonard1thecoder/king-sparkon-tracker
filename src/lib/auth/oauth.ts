export type OAuthProviderId = "google" | "facebook" | "x";

export type OAuthProviderStatus = {
  id: string;
  displayName: string;
  enabled: boolean;
};

export const OAUTH_PROVIDERS: ReadonlyArray<{ id: OAuthProviderId; displayName: string }> = [
  { id: "google", displayName: "Google" },
  { id: "facebook", displayName: "Facebook" },
  { id: "x", displayName: "X" },
];

const DEV_API_FALLBACK = "http://localhost:8080";

export function apiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }
  if (process.env.NODE_ENV !== "production") {
    return DEV_API_FALLBACK;
  }
  return "";
}

export function oauthAuthorizationUrl(provider: OAuthProviderId) {
  const base = apiBaseUrl();
  if (!base) {
    return null;
  }
  return `${base}/oauth2/authorization/${provider}`;
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
