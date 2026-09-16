import { useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTipTray } from "@/store/tip-tray-context";
import { useAuth } from "@/store/auth-context";
import { createPayFastCartPayment, getPayFastCartPaymentStatus, payPageUrl } from "@/lib/api";
import { idempotencyKey } from "@/lib/api-client";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

// Tip cart — pays tip intents through the shared PayFast cart payout
// (POST /payments/payfast), like products, tickets and UIF carts.
// Mirrors web `/dashboard/user/tips/cart`.
export default function TipCartScreen() {
  const { lines, total, loading, refresh, remove, clear } = useTipTray();
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);

  async function checkout() {
    if (lines.length === 0) {
      setError("Scan a worker QR and add at least one tip before checkout.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setStage("Securing your tip total...");
      const payment = await createPayFastCartPayment({
        idempotencyKey: idempotencyKey("tip-cart"),
        buyerName: user?.username ?? "Registered user",
        buyerEmail: user?.emailAddress ?? "registered-user@king-sparkon.local",
        products: [],
        tickets: [],
        tips: lines.map((line) => ({ workerId: line.workerId, tipAmount: Number(line.tipAmount) })),
      });
      setStage("Opening secure PayFast payout...");
      await WebBrowser.openBrowserAsync(payPageUrl(payment.merchantPaymentId));
      setStage("Checking payment...");
      const status = await getPayFastCartPaymentStatus(payment.merchantPaymentId).catch(() => null);
      if (status && status.fulfilled) {
        await clear();
        setStage("Payment verified — tip cart cleared.");
      } else {
        setStage("Browser closed. Pull to refresh — the cart clears once payment verifies.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
      setStage(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Tip cart</Title>
      <Subtitle>
        One shared PayFast payout for all tips. {lines.length > 0 ? `Total R${total.toFixed(2)}.` : ""}
      </Subtitle>
      {stage ? <StatusPill label={stage} tone="action" /> : null}
      <ErrorText message={error} />
      <FlatList
        data={lines}
        keyExtractor={(item, index) => `${item.workerId}-${item.tipAmount}-${index}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>{item.workerLabel}</Text>
            <Text style={{ fontWeight: "800", fontSize: 18 }}>R{item.tipAmount.toFixed(2)}</Text>
            <StatusPill label={`Worker #${item.workerId}`} tone="action" />
            <PrimaryButton title="Remove" onPress={() => void remove(item.workerId, Number(item.tipAmount))} />
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <Card>
              <Text style={{ fontWeight: "800" }}>Tip cart is empty</Text>
              <Text>Scan a worker QR, set an amount, and submit it here to pay.</Text>
              <Link href="/(tabs)/tips" style={{ color: "#C93316", fontWeight: "800" }}>
                Scan worker QR →
              </Link>
            </Card>
          ) : null
        }
      />
      {lines.length > 0 ? (
        <PrimaryButton
          title={busy ? "Securing payout..." : `Pay R${total.toFixed(2)} via PayFast`}
          onPress={() => void checkout()}
          disabled={busy}
        />
      ) : null}
    </Screen>
  );
}
