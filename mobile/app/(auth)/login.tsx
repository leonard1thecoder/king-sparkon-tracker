import { useEffect, useState } from "react";
import { Link, router } from "expo-router";
import { View } from "react-native";
import { useAuth } from "@/store/auth-context";
import {
  AuthBrand,
  AuthCard,
  AuthCheckbox,
  AuthDescription,
  AuthEyebrow,
  AuthField,
  AuthFooter,
  AuthScreen,
  AuthStatus,
  AuthSubmit,
  AuthTitle,
} from "@/components/auth";
import { tokens } from "@/theme/tokens";

// Mirrors web `/login` (AuthShell mode=login): same copy, fields,
// helpers, remember-device checkbox, verification links and footer.
export default function LoginScreen() {
  const { user, loading, signIn, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) router.replace("/(tabs)/shop");
  }, [loading, user]);

  async function onSubmit() {
    if (!username.trim()) {
      setLocalError("Complete username before submitting.");
      return;
    }
    if (!password) {
      setLocalError("Complete password before submitting.");
      return;
    }
    setBusy(true);
    setLocalError(null);
    setNotice(null);
    try {
      await signIn(username.trim(), password);
      setNotice("Signed in successfully. Opening your role dashboard.");
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Unable to reach the auth API.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen>
      <AuthBrand />
      <View>
        <AuthEyebrow>Welcome back</AuthEyebrow>
        <AuthTitle>Sign in to your King Sparkon workspace</AuthTitle>
        <AuthDescription>
          Use your User account. After login, King Sparkon Tracker opens the dashboard that matches your role.
        </AuthDescription>
      </View>
      <AuthCard>
        <AuthField
          label="Username"
          value={username}
          onChange={setUsername}
          placeholder="Example: owner_admin"
          helper="Required. This is the account username created for the workspace."
        />
        <AuthField
          label="Password"
          value={password}
          onChange={setPassword}
          placeholder="Account password"
          secure
          helper="Required. Use the account password for this workspace."
        />
        <AuthCheckbox label="Remember this device" checked={remember} onChange={setRemember} />
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Link href="/(auth)/resend-verification" style={{ color: tokens.signalStrong, fontWeight: "800", fontSize: 13 }}>
            Resend verification
          </Link>
          <Link href="/(auth)/forgot-password" style={{ color: tokens.signalStrong, fontWeight: "800", fontSize: 13 }}>
            Forgot password?
          </Link>
        </View>
        <AuthStatus tone="error" message={localError ?? error} />
        <AuthStatus tone="success" message={notice} />
        <AuthSubmit title="Sign in securely" busy={busy} onPress={() => void onSubmit()} />
      </AuthCard>
      <AuthFooter text="New to King Sparkon Tracker?" href="/(auth)/register" link="Register account" />
    </AuthScreen>
  );
}
