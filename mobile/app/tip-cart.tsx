import { useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTipTray } from "@/store/tip-tray-context";
import { useAuth } from "@/store/auth-context";
import { capturePayPalOrder, createPayFastCartPayment, createPayPalOrder, getPayFastCartPaymentStatus, getPayPalOrderStatus, payPageUrl } from "@/lib/api";
import { convertZarToUsd, formatMoney, useLocalization } from "@/lib/localization";
import { idempotencyKey } from "@/lib/api-client";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

// Tip cart — pays tip intents through the shared cart payout
// (PayFast in ZAR, PayPal in USD), like products, tickets and UIF carts.
// Mirrors web `/dashboard/user/tips/cart`.
export default function TipCartScreen() {
  const { lines, total, loading, refresh, remove, clear } = useTipTray();
  const { user } = useAuth();
  const localization = useLocalization();
  const payWithPayPal = localization.currency === "USD";
  const showMoney = (zar: number) =>
    formatMoney(payWithPayPal ? convertZarToUsd(zar, localization.usdToZarRate) : zar, localization.currency);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<string | null>(null);
  const [pendingPayPalOrder, setPendingPayPalOrder] = useState<string | null>(null);

  async function checkout() {
    if (lines.length === 0) {
      setError("Scan a worker QR and add at least one tip before checkout.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setStage("Securing your tip total...");
      const payload = {
        idempotencyKey: idempotencyKey("tip-cart"),
        buyerName: user?.username ?? "Registered user",
        buyerEmail: user?.emailAddress ?? "registered-user@king-sparkon.local",
        products: [],
        tickets: [],
        tips: lines.map((line) => ({ workerId: line.workerId, tipAmount: Number(line.tipAmount) })),
      };
      if (payWithPayPal) {
        if (!localization.paypalCheckoutEnabled) {
          throw new Error("PayPal checkout is not enabled. Contact support.");
        }
        const order = await createPayPalOrder(payload);
        setPendingPayPalOrder(order.orderId);
        setStage(`Opening PayPal for ${formatMoney(order.amountUsd, "USD")}...`);
        await WebBrowser.openBrowserAsync(order.approveUrl);
        setStage("Checking payment...");
        try {
          await capturePayPalOrder(order.orderId);
        } catch {
          // Capture may already have run — fall through to status check.
        }
        const status = await getPayPalOrderStatus(order.orderId).catch(() => null);
        if (status && status.fulfilled) {
          await clear();
          setPendingPayPalOrder(null);
          setStage("Payment verified — tip cart cleared.");
        } else {
          setStage("Browser closed. Tap Check payment after approving on PayPal.");
        }
        return;
      }
      const payment = await createPayFastCartPayment(payload);
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

  async function checkPayPal() {
    if (!pendingPayPalOrder) return;
    setBusy(true);
    setError(null);
    try {
      setStage("Checking PayPal payment...");
      const status = await getPayPalOrderStatus(pendingPayPalOrder).catch(() => null);
      if (status && status.fulfilled) {
        await clear();
        setPendingPayPalOrder(null);
        setStage("Payment verified — tip cart cleared.");
      } else {
        setStage("Not captured yet. Approve on PayPal, then check again.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Tip cart</Title>
      <Subtitle>
        One shared {payWithPayPal ? "PayPal" : "PayFast"} payout for all tips. {lines.length > 0 ? `Total ${showMoney(total)}.` : ""}
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
            <Text style={{ fontWeight: "800", fontSize: 18 }}>{showMoney(Number(item.tipAmount))}</Text>
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
        <>
          <PrimaryButton
            title={busy ? "Securing payout..." : payWithPayPal ? `Pay ${showMoney(total)} via PayPal` : `Pay R${total.toFixed(2)} via PayFast`}
            onPress={() => void checkout()}
            disabled={busy}
          />
          {payWithPayPal && pendingPayPalOrder ? (
            <PrimaryButton
              title={busy ? "Checking..." : "Check PayPal payment"}
              onPress={() => void checkPayPal()}
              disabled={busy}
            />
          ) : null}
        </>
      ) : null}
    </Screen>
  );
}
