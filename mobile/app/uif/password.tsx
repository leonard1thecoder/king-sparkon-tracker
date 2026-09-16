import { useState } from "react";
import { Link } from "expo-router";
import { StyleSheet, Text, TextInput } from "react-native";
import { createUifResetCart } from "@/lib/api";
import type { UifResetCartResponse } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { UifHint, UifIdInput, isValidUifId } from "@/components/uif";
import { tokens } from "@/theme/tokens";

export default function UifPasswordScreen() {
  const [idNumber, setIdNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cart, setCart] = useState<UifResetCartResponse | null>(null);

  async function submit() {
    if (!isValidUifId(idNumber)) {
      setError("Enter a valid 13-digit ID number.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }
    setBusy(true);
    setError(null);
    setCart(null);
    try {
      setCart(await createUifResetCart({ idNumber: idNumber.trim(), password, confirmPassword }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Password reset request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Update UIF Password</Title>
      <Subtitle>Mirrors web `/dashboard/user/uif/password`. Creates a R14.28 reset cart.</Subtitle>
      <Card>
        <UifIdInput value={idNumber} onChange={setIdNumber} />
        <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="New password (min 8)" style={styles.input} />
        <TextInput value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder="Confirm password" style={styles.input} />
        <UifHint>Paying the reset cart triggers the password update.</UifHint>
        <ErrorText message={error} />
        <PrimaryButton title={busy ? "Requesting…" : "Update UIF Password"} onPress={() => void submit()} disabled={busy} />
      </Card>
      {cart ? (
        <Card>
          <StatusPill label={cart.status} tone="action" />
          <Text>Order {cart.orderId} · {cart.currency} {String(cart.amount)}</Text>
          {cart.message ? <Text style={{ fontSize: 12 }}>{cart.message}</Text> : null}
          <Link href="/uif/cart" style={styles.link}>
            Open UIF cart →
          </Link>
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
  link: { color: tokens.signalStrong, fontWeight: "800" },
});
