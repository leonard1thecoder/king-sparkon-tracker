import { describe, expect, test } from "vitest";
import { apiBaseUrl, oauthAuthorizationUrl, oauthErrorMessage } from "./oauth";

describe("oauth helpers", () => {
  test("builds provider authorization urls against the backend", () => {
    expect(oauthAuthorizationUrl("google")).toBe("http://localhost:8080/oauth2/authorization/google");
    expect(oauthAuthorizationUrl("facebook")).toBe("http://localhost:8080/oauth2/authorization/facebook");
    expect(oauthAuthorizationUrl("x")).toBe("http://localhost:8080/oauth2/authorization/x");
    expect(oauthAuthorizationUrl("tiktok")).toBe("http://localhost:8080/oauth2/authorization/tiktok");
  });

  test("exposes the configured api base url", () => {
    expect(apiBaseUrl()).toBe("http://localhost:8080");
  });

  test("maps backend failure codes to user-friendly copy", () => {
    expect(oauthErrorMessage("access_denied")).toContain("cancelled");
    expect(oauthErrorMessage("missing_email")).toContain("email address");
    expect(oauthErrorMessage("unverified_email")).toContain("password first");
    expect(oauthErrorMessage("account_exists")).toContain("original method");
    expect(oauthErrorMessage("provider_error")).toContain("failed");
    expect(oauthErrorMessage("exchange_failed")).toContain("expired");
  });

  test("returns null for unknown or missing codes", () => {
    expect(oauthErrorMessage(null)).toBeNull();
    expect(oauthErrorMessage(undefined)).toBeNull();
    expect(oauthErrorMessage("")).toBeNull();
    expect(oauthErrorMessage("stack_trace_here")).toBeNull();
  });
});
