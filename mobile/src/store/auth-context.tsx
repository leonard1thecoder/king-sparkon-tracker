import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { router } from "expo-router";
import { clearTokens, getAccessToken, saveTokens } from "@/lib/auth-storage";
import { getMe, loginRequest } from "@/lib/api";
import type { TrackerUser } from "@/lib/types";

type AuthState = {
  user: TrackerUser | null;
  loading: boolean;
  error: string | null;
  signIn: (usernameOrEmail: string, password: string) => Promise<void>;
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

  const value = useMemo(() => ({ user, loading, error, signIn, signOut, refresh }), [user, loading, error, signIn, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
