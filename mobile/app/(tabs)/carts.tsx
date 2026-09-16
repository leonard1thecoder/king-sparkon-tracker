import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { listMyPurchases } from "@/lib/api";
import type { TuckShopPurchase } from "@/lib/types";
import { Card, ErrorText, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function MyCartsScreen() {
  const [purchases, setPurchases] = useState<TuckShopPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listMyPurchases();
      setPurchases(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load purchase history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>My carts</Title>
      <Subtitle>Review product purchases and collections — mirrors web `/dashboard/user/carts`.</Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={purchases}
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
                {line.productName} × {line.quantity} — R{line.lineTotal.toFixed(2)}
              </Text>
            ))}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No completed carts yet.</Text> : null}
      />
    </Screen>
  );
}
