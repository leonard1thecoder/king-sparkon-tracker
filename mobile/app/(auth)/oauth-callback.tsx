import { useEffect, useRef, useState } from "react";
import { Link, router, useLocalSearchParams } from "expo-router";
import { useAuth } from "@/store/auth-context";
import { AuthCard, AuthDescription, AuthScreen, AuthStatus, AuthTitle } from "@/components/auth";
import { tokens } from "@/theme/tokens";

// Deep-link fallback for OAuth: handles `kingsparkon://(auth)/oauth-callback`
// when the app cold-starts from the provider redirect. The warm path returns
// through `openAuthSessionAsync` directly into `signInWithProvider`.
export default function OAuthCallbackScreen() {
  const { user, loading, completeOAuthCallback } = useAuth();
  const { code, error } = useLocalSearchParams<{ code?: string; error?: string }>();
  const [notice, setNotice] = useState<string | null>("Completing the secure sign-in...");
  const [failed, setFailed] = useState<string | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!loading && user) router.replace("/(tabs)/shop");
  }, [loading, user]);

  useEffect(() => {
    if (done.current || loading) return;
    done.current = true;
    completeOAuthCallback({ code, error })
      .then(() => setNotice("Signed in successfully. Opening your role dashboard."))
      .catch((e: unknown) => {
        setNotice(null);
        setFailed(e instanceof Error ? e.message : "The sign-in could not be completed.");
      });
  }, [loading, code, error, completeOAuthCallback]);

  return (
    <AuthScreen>
      <AuthTitle>Completing sign in</AuthTitle>
      <AuthDescription>Finishing the secure provider sign-in for King Sparkon.</AuthDescription>
      <AuthCard>
        {notice ? <AuthStatus tone="success" message={notice} /> : null}
        <AuthStatus tone="error" message={failed} />
        {failed ? (
          <Link href="/(auth)/login" style={{ color: tokens.signalStrong, fontWeight: "900", fontSize: 14 }}>
            Back to sign in
          </Link>
        ) : null}
      </AuthCard>
    </AuthScreen>
  );
}
