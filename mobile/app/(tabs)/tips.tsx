import { useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { createTip } from "@/lib/api";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function TipsScreen() {
  const [workerId, setWorkerId] = useState("");
  const [amount, setAmount] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  async function sendTip() {
    const parsedWorker = Number(workerId);
    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedWorker) || !Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setError("Enter a valid worker ID and amount.");
      return;
    }
    setBusy(true);
    setError(null);
    setPaymentUrl(null);
    try {
      const tip = await createTip({
        workerId: parsedWorker,
        tipAmount: parsedAmount,
        callbackUrl: "kingsparkon://tips/callback",
        clientContact: contact.trim() || undefined,
      });
      if (tip.paymentUrl) {
        setPaymentUrl(tip.paymentUrl);
        await WebBrowser.openBrowserAsync(tip.paymentUrl);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tip failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Tip worker</Title>
      <Subtitle>Support workers directly — mirrors web `/dashboard/user/tips`.</Subtitle>
      <Card>
        <Text style={styles.label}>Worker ID</Text>
        <TextInput value={workerId} onChangeText={setWorkerId} keyboardType="number-pad" placeholder="e.g. 12" style={styles.input} />
        <Text style={styles.label}>Amount (R)</Text>
        <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="e.g. 25" style={styles.input} />
        <Text style={styles.label}>Your contact (optional)</Text>
        <TextInput value={contact} onChangeText={setContact} placeholder="082…" keyboardType="phone-pad" style={styles.input} />
        <ErrorText message={error} />
        {paymentUrl ? <StatusPill label="Payment opened in browser" tone="action" /> : null}
        <PrimaryButton title={busy ? "Sending…" : "Send tip"} onPress={() => void sendTip()} disabled={busy} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: tokens.ink, fontSize: 13, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
});
