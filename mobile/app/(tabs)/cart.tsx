import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { capturePayPalOrder, createPayFastCartPayment, createPayPalOrder, createTuckShopPurchase, getPayFastCartPaymentStatus, getPayPalOrderStatus, payPageUrl } from "@/lib/api";
import { idempotencyKey } from "@/lib/api-client";
import { convertZarToUsd, formatMoney, useLocalization } from "@/lib/localization";
import { isServiceLine, lineCredit, lineDeposit, lineEmpties, lineNet, useCart, type ProductCartLine } from "@/store/cart-context";
import { useAuth } from "@/store/auth-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function CartScreen() {
  const { lines, total, netTotal, depositTotal, creditTotal, returnableUnitCount, emptiesCount, setQuantity, setEmpties, remove } = useCart();
  const { user } = useAuth();
  const localization = useLocalization();
  const payWithPayPal = localization.currency === "USD";
  const showMoney = (zar: number) => formatMoney(payWithPayPal ? convertZarToUsd(zar, localization.usdToZarRate) : zar, localization.currency);
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [serviceBusy, setServiceBusy] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceStage, setServiceStage] = useState<string | null>(null);
  const [pendingPayPalOrder, setPendingPayPalOrder] = useState<string | null>(null);

  const serviceLines = lines.filter(isServiceLine);
  const serviceTotal = serviceLines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  async function checkout() {
    const productLines = lines.filter((line): line is ProductCartLine => !isServiceLine(line));
    if (productLines.length === 0) {
      setError("Cart has no products — pay service lines below.");
      return;
    }
    setBusy(true);
    setError(null);
    setReference(null);
    try {
      const purchase = await createTuckShopPurchase({
        paymentEmail: email.trim() || undefined,
        paymentContact: contact.trim() || undefined,
        items: productLines.map((line) => ({ productId: line.productId, quantity: line.quantity, emptiesReturned: lineEmpties(line) })),
      });
      setReference(`Order ${purchase.transactionId} · ${purchase.paymentStatus ?? "PENDING"}`);
      productLines.forEach((line) => remove(line.productId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  async function checkoutServices() {
    if (serviceLines.length === 0) {
      setServiceError("No service lines to pay.");
      return;
    }
    setServiceBusy(true);
    setServiceError(null);
    try {
      setServiceStage("Securing your service total...");
      const payload = {
        idempotencyKey: idempotencyKey("service-cart"),
        buyerName: user?.username ?? "Registered user",
        buyerEmail: user?.emailAddress ?? email.trim() ?? "registered-user@king-sparkon.local",
        products: [],
        tickets: [],
        tips: [],
        services: serviceLines.map((line) => ({
          kind: line.serviceKind,
          referenceId: line.referenceId,
          label: line.label,
          amount: Number(line.price),
        })),
      };
      if (payWithPayPal) {
        if (!localization.paypalCheckoutEnabled) {
          throw new Error("PayPal checkout is not enabled. Contact support.");
        }
        const order = await createPayPalOrder(payload);
        setPendingPayPalOrder(order.orderId);
        setServiceStage(`Opening PayPal for ${formatMoney(order.amountUsd, "USD")}...`);
        await WebBrowser.openBrowserAsync(order.approveUrl);
        setServiceStage("Checking payment...");
        try {
          await capturePayPalOrder(order.orderId);
        } catch {
          // Capture may already have run — fall through to status check.
        }
        const status = await getPayPalOrderStatus(order.orderId).catch(() => null);
        if (status && status.fulfilled) {
          serviceLines.forEach((line) => remove(line.key));
          setServiceStage("Payment verified — service lines cleared.");
        } else {
          setServiceStage("Browser closed. Tap Check payment after approving on PayPal.");
        }
        return;
      }
      const payment = await createPayFastCartPayment(payload);
      setServiceStage("Opening secure PayFast payout...");
      await WebBrowser.openBrowserAsync(payPageUrl(payment.merchantPaymentId));
      setServiceStage("Checking payment...");
      const status = await getPayFastCartPaymentStatus(payment.merchantPaymentId).catch(() => null);
      if (status && status.fulfilled) {
        serviceLines.forEach((line) => remove(line.key));
        setServiceStage("Payment verified — service lines cleared.");
      } else {
        setServiceStage("Browser closed. Reopen this screen — lines clear once payment verifies.");
      }
    } catch (e) {
      setServiceError(e instanceof Error ? e.message : "Service checkout failed.");
      setServiceStage(null);
    } finally {
      setServiceBusy(false);
    }
  }

  async function checkPayPalServices() {
    setServiceBusy(true);
    setServiceError(null);
    try {
      setServiceStage("Checking PayPal payment...");
      const status = await getPayPalOrderStatus(pendingPayPalOrder).catch(() => null);
      if (status && status.fulfilled) {
        serviceLines.forEach((line) => remove(line.key));
        setPendingPayPalOrder(null);
        setServiceStage("Payment verified — service lines cleared.");
      } else {
        setServiceStage("Not captured yet. Approve on PayPal, then check again.");
      }
    } catch (e) {
      setServiceError(e instanceof Error ? e.message : "Payment check failed.");
    } finally {
      setServiceBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Cart</Title>
      <Subtitle>Review and pay — mirrors web `/dashboard/user/shop/cart`.</Subtitle>
      <FlatList
        data={lines}
        keyExtractor={(item) => (isServiceLine(item) ? item.key : String(item.productId))}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) =>
          isServiceLine(item) ? (
            <Card>
              <Text style={styles.name}>{item.label}</Text>
              <Text style={styles.meta}>
                {item.serviceKind} · {showMoney(item.price)}
              </Text>
              <View style={styles.row}>
                <PrimaryButton title="Remove" onPress={() => remove(item.key)} />
              </View>
            </Card>
          ) : (
            <Card>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {showMoney(item.price)} × {item.quantity} = {showMoney(item.price * item.quantity)}
              </Text>
              {item.returnableEnabled ? (
                <Text style={styles.returnable}>
                  Returnable · {showMoney(lineDeposit(item))} deposit each
                </Text>
              ) : null}
              {lineCredit(item) > 0 ? (
                <Text style={styles.credit}>
                  Empties credit −{showMoney(lineCredit(item))} · to pay {showMoney(lineNet(item))}
                </Text>
              ) : null}
              <View style={styles.row}>
                <PrimaryButton title="−" onPress={() => setQuantity(item.productId, item.quantity - 1)} />
                <PrimaryButton title="+" onPress={() => setQuantity(item.productId, item.quantity + 1)} />
                <PrimaryButton title="Remove" onPress={() => remove(item.productId)} />
              </View>
              {item.returnableEnabled && lineDeposit(item) > 0 ? (
                <View style={styles.row}>
                  <PrimaryButton
                    title="Empty −"
                    onPress={() => setEmpties(item.productId, lineEmpties(item) - 1)}
                  />
                  <Text style={styles.meta}>
                    Empties back {lineEmpties(item)} of {item.quantity} (max)
                  </Text>
                  <PrimaryButton
                    title="Empty +"
                    onPress={() => setEmpties(item.productId, lineEmpties(item) + 1)}
                  />
                </View>
              ) : null}
            </Card>
          )
        }
        ListEmptyComponent={<Text style={styles.meta}>Cart is empty. Add products from Shop.</Text>}
      />
      <Card>
        <Text style={styles.total}>Total {showMoney(total)}</Text>
        {returnableUnitCount > 0 ? (
          <Text style={styles.meta}>
            Returnables in cart: {emptiesCount} of {returnableUnitCount} empties back · deposits {showMoney(depositTotal)}
            {creditTotal > 0 ? ` · credit −${showMoney(creditTotal)}` : ""}
          </Text>
        ) : null}
        {creditTotal > 0 ? <Text style={styles.total}>To pay {showMoney(netTotal)}</Text> : null}
        <TextInput value={email} onChangeText={setEmail} placeholder="Payment email (website payment)" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput value={contact} onChangeText={setContact} placeholder="Payment contact" keyboardType="phone-pad" style={styles.input} />
        <ErrorText message={error} />
        {reference ? <StatusPill label={reference} tone="success" /> : null}
        <PrimaryButton title={busy ? "Paying…" : "Checkout"} onPress={() => void checkout()} disabled={busy || lines.length === 0} />
      </Card>
      {serviceLines.length > 0 ? (
        <Card>
          <Text style={styles.total}>Services {showMoney(serviceTotal)}</Text>
          <Text style={styles.meta}>
            {payWithPayPal
              ? "Care plans, hub access and dev builds pay through the shared PayPal payout in USD."
              : "Care plans, hub access and dev builds pay through the shared PayFast payout."}
          </Text>
          {serviceStage ? <StatusPill label={serviceStage} tone="action" /> : null}
          <ErrorText message={serviceError} />
          <PrimaryButton
            title={serviceBusy ? "Securing payout..." : payWithPayPal ? `Pay services ${showMoney(serviceTotal)} via PayPal` : `Pay services R${serviceTotal.toFixed(2)} via PayFast`}
            onPress={() => void checkoutServices()}
            disabled={serviceBusy}
          />
          {payWithPayPal && pendingPayPalOrder ? (
            <PrimaryButton
              title={serviceBusy ? "Checking..." : "Check PayPal payment"}
              onPress={() => void checkPayPalServices()}
              disabled={serviceBusy}
            />
          ) : null}
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontWeight: "800", fontSize: 15 },
  meta: { fontSize: 12, fontWeight: "600", opacity: 0.7 },
  returnable: { fontSize: 12, fontWeight: "800", color: "#1C7C54" },
  credit: { fontSize: 12, fontWeight: "800", color: "#1C7C54" },
  row: { flexDirection: "row", gap: 8, alignItems: "center" },
  total: { fontWeight: "800", fontSize: 16 },
  input: { borderWidth: 1, borderColor: "#D8D3C4", borderRadius: 12, padding: 10, backgroundColor: "#fff" },
});
