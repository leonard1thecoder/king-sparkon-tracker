import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { createPayFastCartPayment, createTuckShopPurchase, getPayFastCartPaymentStatus, payPageUrl } from "@/lib/api";
import { idempotencyKey } from "@/lib/api-client";
import { isServiceLine, useCart } from "@/store/cart-context";
import { useAuth } from "@/store/auth-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function CartScreen() {
  const { lines, total, setQuantity, remove } = useCart();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [serviceBusy, setServiceBusy] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [serviceStage, setServiceStage] = useState<string | null>(null);

  const serviceLines = lines.filter(isServiceLine);
  const serviceTotal = serviceLines.reduce((sum, line) => sum + line.price * line.quantity, 0);

  async function checkout() {
    const productLines = lines.filter((line) => !isServiceLine(line));
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
        items: productLines.map((line) => ({ productId: (line as { productId: number }).productId, quantity: line.quantity })),
      });
      setReference(`Order ${purchase.transactionId} · ${purchase.paymentStatus ?? "PENDING"}`);
      productLines.forEach((line) => remove((line as { productId: number }).productId));
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
      const payment = await createPayFastCartPayment({
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
      });
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
                {item.serviceKind} · R{item.price.toFixed(2)}
              </Text>
              <View style={styles.row}>
                <PrimaryButton title="Remove" onPress={() => remove(item.key)} />
              </View>
            </Card>
          ) : (
            <Card>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                R{item.price.toFixed(2)} × {item.quantity} = R{(item.price * item.quantity).toFixed(2)}
              </Text>
              <View style={styles.row}>
                <PrimaryButton title="−" onPress={() => setQuantity(item.productId, item.quantity - 1)} />
                <PrimaryButton title="+" onPress={() => setQuantity(item.productId, item.quantity + 1)} />
                <PrimaryButton title="Remove" onPress={() => remove(item.productId)} />
              </View>
            </Card>
          )
        }
        ListEmptyComponent={<Text style={styles.meta}>Cart is empty. Add products from Shop.</Text>}
      />
      <Card>
        <Text style={styles.total}>Total R{total.toFixed(2)}</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="Payment email (website payment)" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput value={contact} onChangeText={setContact} placeholder="Payment contact" keyboardType="phone-pad" style={styles.input} />
        <ErrorText message={error} />
        {reference ? <StatusPill label={reference} tone="success" /> : null}
        <PrimaryButton title={busy ? "Paying…" : "Checkout"} onPress={() => void checkout()} disabled={busy || lines.length === 0} />
      </Card>
      {serviceLines.length > 0 ? (
        <Card>
          <Text style={styles.total}>Services R{serviceTotal.toFixed(2)}</Text>
          <Text style={styles.meta}>Care plans, hub access and dev builds pay through the shared PayFast payout.</Text>
          {serviceStage ? <StatusPill label={serviceStage} tone="action" /> : null}
          <ErrorText message={serviceError} />
          <PrimaryButton
            title={serviceBusy ? "Securing payout..." : `Pay services R${serviceTotal.toFixed(2)} via PayFast`}
            onPress={() => void checkoutServices()}
            disabled={serviceBusy}
          />
        </Card>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  name: { fontWeight: "800", fontSize: 15 },
  meta: { fontSize: 12, fontWeight: "600", opacity: 0.7 },
  row: { flexDirection: "row", gap: 8 },
  total: { fontWeight: "800", fontSize: 16 },
  input: { borderWidth: 1, borderColor: "#D8D3C4", borderRadius: 12, padding: 10, backgroundColor: "#fff" },
});
