import { useState } from "react";
import { Link, router } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { registerAffiliateRequest, registerOwnerRequest } from "@/lib/api";
import { Card, ErrorText, PrimaryButton, Screen, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function RegisterScreen() {
  const [mode, setMode] = useState<"owner" | "affiliate">("owner");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit() {
    if (!username.trim() || !email.trim() || !password) {
      setError("Username, email and password are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const payload = { username: username.trim(), emailAddress: email.trim(), password };
      if (mode === "owner") await registerOwnerRequest(payload);
      else await registerAffiliateRequest(payload);
      router.replace("/(auth)/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Registration failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <View style={{ height: 24 }} />
      <Title>Create account</Title>
      <Subtitle>Public registration mirrors web `/register` and `/register-affiliate`.</Subtitle>
      <View style={styles.segment}>
        {(["owner", "affiliate"] as const).map((entry) => (
          <Pressable key={entry} onPress={() => setMode(entry)} style={[styles.chip, mode === entry && styles.chipActive]}>
            <Text style={[styles.chipText, mode === entry && styles.chipTextActive]}>{entry}</Text>
          </Pressable>
        ))}
      </View>
      <Card>
        <Text style={styles.label}>Username</Text>
        <TextInput value={username} onChangeText={setUsername} autoCapitalize="none" style={styles.input} />
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" style={styles.input} />
        <Text style={styles.label}>Password</Text>
        <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
        <ErrorText message={error} />
        <PrimaryButton title={busy ? "Creating…" : `Create ${mode} account`} onPress={onSubmit} disabled={busy} />
      </Card>
      <Link href="/(auth)/login" asChild>
        <Pressable style={styles.link}>
          <Text style={styles.linkText}>Already have an account? Sign in</Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  segment: { flexDirection: "row", gap: 8 },
  chip: { borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 16, backgroundColor: "#fff" },
  chipActive: { backgroundColor: tokens.ink, borderColor: tokens.ink },
  chipText: { fontWeight: "800", color: tokens.steel, textTransform: "capitalize" },
  chipTextActive: { color: "#fff" },
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
