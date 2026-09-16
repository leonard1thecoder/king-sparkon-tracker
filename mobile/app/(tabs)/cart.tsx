import { useState } from "react";
import { FlatList, StyleSheet, Text, TextInput, View } from "react-native";
import { createTuckShopPurchase } from "@/lib/api";
import { useCart } from "@/store/cart-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function CartScreen() {
  const { lines, total, setQuantity, remove, clear } = useCart();
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);

  async function checkout() {
    if (lines.length === 0) {
      setError("Cart is empty.");
      return;
    }
    setBusy(true);
    setError(null);
    setReference(null);
    try {
      const purchase = await createTuckShopPurchase({
        paymentEmail: email.trim() || undefined,
        paymentContact: contact.trim() || undefined,
        items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
      });
      setReference(`Order ${purchase.transactionId} · ${purchase.paymentStatus ?? "PENDING"}`);
      clear();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Cart</Title>
      <Subtitle>Review and pay — mirrors web `/dashboard/user/shop/cart`.</Subtitle>
      <FlatList
        data={lines}
        keyExtractor={(item) => String(item.productId)}
        contentContainerStyle={{ gap: 10 }}
        renderItem={({ item }) => (
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
        )}
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
