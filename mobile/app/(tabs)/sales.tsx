import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { listCompletedWorkerPurchases, listTransactions } from "@/lib/api";
import { normalizeList, type TuckShopPurchase } from "@/lib/types";
import { Card, ErrorText, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function WorkerSalesScreen() {
  const [sales, setSales] = useState<TuckShopPurchase[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [completed, transactions] = await Promise.all([
        listCompletedWorkerPurchases().catch(() => []),
        listTransactions().catch(() => []),
      ]);
      const rows = normalizeList(completed as TuckShopPurchase[] | { content: TuckShopPurchase[] });
      setSales(rows);
      const tx = normalizeList(transactions as unknown[] | { content: unknown[] });
      setCount(tx.length);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load sales.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Product sales</Title>
      <Subtitle>
        Paid counter checkouts and collected online carts — mirrors web `/dashboard/worker/transactions`
        {count > 0 ? ` · ${count} counter transactions` : ""}.
      </Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={sales}
        keyExtractor={(item) => String(item.transactionId)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800" }}>
              Sale {item.transactionId} · R{item.productTotal.toFixed(2)}
            </Text>
            <StatusPill label={item.fulfilmentStatus ?? item.paymentStatus ?? "PAID"} tone="success" />
            {item.items.map((line) => (
              <Text key={line.productId} style={{ fontSize: 12 }}>
                {line.productName} × {line.quantity}
              </Text>
            ))}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No completed sales yet.</Text> : null}
      />
    </Screen>
  );
}
