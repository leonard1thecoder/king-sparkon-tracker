import { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import { StyleSheet, Text, TextInput } from "react-native";
import { getUifResetCartStatus } from "@/lib/api";
import type { UifResetCartResponse } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function UifCartScreen() {
  const [merchantPaymentId, setMerchantPaymentId] = useState("");
  const [status, setStatus] = useState<UifResetCartResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!merchantPaymentId.trim()) {
      setError("Enter the merchant payment ID from your reset request.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setStatus(await getUifResetCartStatus(merchantPaymentId.trim()));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load cart status.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>UIF Cart — R14.28</Title>
      <Subtitle>Mirrors web `/dashboard/user/uif/cart`. Paying triggers the password update.</Subtitle>
      <Card>
        <TextInput
          value={merchantPaymentId}
          onChangeText={setMerchantPaymentId}
          autoCapitalize="none"
          placeholder="Merchant payment ID"
          style={styles.input}
        />
        <ErrorText message={error} />
        <PrimaryButton title={busy ? "Checking…" : "Check payment status"} onPress={() => void check()} disabled={busy} />
      </Card>
      {status ? (
        <Card>
          <StatusPill label={status.status} tone={status.status === "PAID" ? "success" : "action"} />
          <Text>
            Order {status.orderId} · {status.currency} {String(status.amount)}
          </Text>
          {status.message ? <Text style={{ fontSize: 12 }}>{status.message}</Text> : null}
          <PrimaryButton
            title="Open payment page"
            onPress={() => {
              const url = (status as { paymentUrl?: string }).paymentUrl;
              if (url) void WebBrowser.openBrowserAsync(url);
              else setError("No payment URL returned yet — try again after a minute.");
            }}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
});
