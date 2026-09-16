import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { assignOnlinePurchaseBarcode, listWorkerOnlinePurchases } from "@/lib/api";
import type { TuckShopPurchase } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<TuckShopPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listWorkerOnlinePurchases();
      setOrders(Array.isArray(result) ? result : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Online orders</Title>
      <Subtitle>Prepare paid carts — mirrors web `/dashboard/worker/orders`.</Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.transactionId)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800" }}>
              Order {item.transactionId} · R{item.productTotal.toFixed(2)}
            </Text>
            <StatusPill label={item.fulfilmentStatus ?? item.paymentStatus ?? "PENDING"} tone="action" />
            {item.items.map((line) => (
              <Text key={line.productId} style={{ fontSize: 12 }}>
                {line.productName} × {line.quantity}
              </Text>
            ))}
            <PrimaryButton
              title="Mark ready (auto barcodes)"
              onPress={() => void assignOnlinePurchaseBarcode(item.transactionId, item.items[0]?.productId ?? 0, "AUTO").catch((e: unknown) => setError(e instanceof Error ? e.message : "Assign failed."))}
            />
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No online orders.</Text> : null}
      />
    </Screen>
  );
}
