import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { clearTokens, getAccessToken, saveTokens } from "@/lib/auth-storage";
import { exchangeOAuthTicket, getMe, loginRequest } from "@/lib/api";
import { backendBaseUrl } from "@/lib/api-client";
import { oauthAuthorizeUrl, oauthErrorMessage, oauthRedirectUri, parseOAuthCallbackUrl } from "@/lib/oauth";
import type { OAuthProviderId } from "@/lib/oauth";
import type { TrackerUser } from "@/lib/types";

type AuthState = {
  user: TrackerUser | null;
  loading: boolean;
  error: string | null;
  signIn: (usernameOrEmail: string, password: string) => Promise<void>;
  signInWithProvider: (provider: OAuthProviderId) => Promise<void>;
  completeOAuthCallback: (params: { code?: string; error?: string }) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<TrackerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const token = await getAccessToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getMe();
      setUser(me);
    } catch {
      await clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (usernameOrEmail: string, password: string) => {
    setError(null);
    try {
      const response = await loginRequest({ usernameOrEmail, password });
      await saveTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
      const me = response.user ?? (response.accessToken ? await getMe() : null);
      setUser(me);
      router.replace("/(tabs)/shop");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign in failed.");
      throw e;
    }
  }, []);

  const signOut = useCallback(async () => {
    await clearTokens();
    setUser(null);
    router.replace("/(public)/products");
  }, []);

  const completeOAuthCallback = useCallback(async (params: { code?: string; error?: string }) => {
    setError(null);
    if (!params.code) {
      const message = oauthErrorMessage(params.error) ?? "The provider sign-in failed.";
      setError(message);
      throw new Error(message);
    }
    try {
      const response = await exchangeOAuthTicket(params.code);
      await saveTokens({ accessToken: response.accessToken, refreshToken: response.refreshToken });
      const me = response.user ?? (response.accessToken ? await getMe() : null);
      setUser(me);
      router.replace("/(tabs)/shop");
    } catch (e) {
      const message = e instanceof Error ? e.message : "The sign-in could not be completed.";
      setError(message);
      throw e instanceof Error ? e : new Error(message);
    }
  }, []);

  const signInWithProvider = useCallback(async (provider: OAuthProviderId) => {
    setError(null);
    const redirectUri = oauthRedirectUri();
    const result = await WebBrowser.openAuthSessionAsync(oauthAuthorizeUrl(backendBaseUrl(), provider), redirectUri);
    if (result.type !== "success") {
      // cancel/dismiss/locked: user left the browser, stay on login silently.
      return;
    }
    const parsed = parseOAuthCallbackUrl(result.url);
    if (!parsed) {
      const message = oauthErrorMessage("exchange_failed") ?? "The sign-in could not be completed.";
      setError(message);
      throw new Error(message);
    }
    await completeOAuthCallback(parsed);
  }, [completeOAuthCallback]);

  const value = useMemo(() => ({ user, loading, error, signIn, signInWithProvider, completeOAuthCallback, signOut, refresh }), [user, loading, error, signIn, signInWithProvider, completeOAuthCallback, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
