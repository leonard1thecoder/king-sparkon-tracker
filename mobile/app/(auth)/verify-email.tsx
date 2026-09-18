import { useEffect, useState } from "react";
import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { verifyEmailRequest } from "@/lib/api";
import { AuthBrand, AuthScreen, AuthTitle } from "@/components/auth";
import { Card } from "@/components/ui";
import { tokens } from "@/theme/tokens";

// Mirrors web `/verify-email`: verifies the token against the backend and
// shows the result card with the next step.
export default function VerifyEmailScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const tokenValue = Array.isArray(token) ? token[0] : token;
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function verify() {
      if (!tokenValue) {
        setState({ ok: false, message: "Verification token is missing from the link." });
        return;
      }
      try {
        const body = (await verifyEmailRequest(tokenValue)) as { message?: string; error?: string };
        if (active) {
          setState({ ok: true, message: body.message ?? "Email verified successfully." });
        }
      } catch (e) {
        if (active) {
          setState({ ok: false, message: e instanceof Error ? e.message : "Email verification failed." });
        }
      }
    }
    void verify();
    return () => {
      active = false;
    };
  }, [tokenValue]);

  return (
    <AuthScreen>
      <AuthBrand />
      <AuthTitle>{state == null ? "Verifying email..." : state.ok ? "Email verified" : "Verification needs attention"}</AuthTitle>
      <Card>
        <View style={{ alignItems: "center", gap: 12 }}>
          <Text style={{ fontSize: 40 }}>{state == null ? "…" : state.ok ? "✓" : "!"}</Text>
          {state ? <Text style={{ color: tokens.steel, fontSize: 14, textAlign: "center" }}>{state.message}</Text> : null}
          {state ? (
            <Link
              href={state.ok ? "/(auth)/login" : "/(auth)/resend-verification"}
              style={{ color: "#fff", backgroundColor: tokens.signal, fontWeight: "900", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 20, overflow: "hidden" }}
            >
              {state.ok ? "Go to sign in" : "Resend verification"}
            </Link>
          ) : null}
        </View>
      </Card>
    </AuthScreen>
  );
}
