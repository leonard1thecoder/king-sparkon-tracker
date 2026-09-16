import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useAuth } from "@/store/auth-context";
import { Card, ErrorText, PrimaryButton, Screen, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function LoginScreen() {
  const { signIn, error } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function onSubmit() {
    if (!usernameOrEmail.trim() || !password) {
      setLocalError("Enter username/email and password.");
      return;
    }
    setBusy(true);
    setLocalError(null);
    try {
      await signIn(usernameOrEmail.trim(), password);
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : "Sign in failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ height: 24 }} />
      <Title>King Sparkon Tracker</Title>
      <Subtitle>User + Worker dashboard — native mobile. Tokens are stored in SecureStore and sent directly to the backend.</Subtitle>
      <Card>
        <Text style={styles.label}>Username or email</Text>
        <TextInput
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="you@example.com"
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" style={styles.input} />
        <ErrorText message={localError ?? error} />
        <PrimaryButton title={busy ? "Signing in…" : "Sign in"} onPress={onSubmit} disabled={busy} />
      </Card>
      <Link href="/(auth)/register" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>New here? Create an owner or affiliate account</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: tokens.ink, fontSize: 13, fontWeight: "800" },
  input: {
    backgroundColor: "#fff",
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: tokens.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: tokens.ink,
  },
  link: { alignItems: "center", padding: 8 },
  linkText: { color: tokens.signalStrong, fontWeight: "800", fontSize: 13 },
});
