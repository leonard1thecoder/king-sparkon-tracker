import { describe, expect, test } from "vitest";
import {
  oauthAuthorizeUrl,
  oauthErrorMessage,
  oauthRedirectUri,
  parseOAuthCallbackUrl,
} from "../oauth";

describe("mobile oauth helpers", () => {
  test("registers the allowlisted deep-link return address", () => {
    expect(oauthRedirectUri()).toBe("kingsparkon://(auth)/oauth-callback");
  });

  test("builds provider authorization urls against the backend", () => {
    expect(oauthAuthorizeUrl("http://localhost:8080", "google")).toBe(
      "http://localhost:8080/api/auth/oauth/authorize/google?redirect_uri=kingsparkon%3A%2F%2F(auth)%2Foauth-callback",
    );
    expect(oauthAuthorizeUrl("http://localhost:8080/", "x")).toContain("/api/auth/oauth/authorize/x?redirect_uri=");
    expect(oauthAuthorizeUrl("http://localhost:8080", "tiktok")).toContain("/api/auth/oauth/authorize/tiktok?redirect_uri=");
  });

  test("parses ticket and error callbacks", () => {
    expect(parseOAuthCallbackUrl("kingsparkon://(auth)/oauth-callback?code=abc123")).toEqual({ code: "abc123" });
    expect(parseOAuthCallbackUrl("kingsparkon://(auth)/oauth-callback?error=access_denied")).toEqual({
      error: "access_denied",
    });
    expect(parseOAuthCallbackUrl("kingsparkon://(auth)/oauth-callback")).toBeNull();
    expect(parseOAuthCallbackUrl(null)).toBeNull();
    expect(parseOAuthCallbackUrl("kingsparkon://(auth)/oauth-callback?other=1")).toBeNull();
  });

  test("maps backend failure codes to user-friendly copy", () => {
    expect(oauthErrorMessage("access_denied")).toContain("cancelled");
    expect(oauthErrorMessage("missing_email")).toContain("email address");
    expect(oauthErrorMessage("exchange_failed")).toContain("expired");
    expect(oauthErrorMessage(null)).toBeNull();
    expect(oauthErrorMessage("stack_trace_here")).toBeNull();
  });
});
