import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { listOwnerProducts } from "@/lib/api";
import { normalizeList, type Product } from "@/lib/types";
import { Card, ErrorText, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function WorkerProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listOwnerProducts({ size: 50 });
      setProducts(normalizeList(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Products & stock</Title>
      <Subtitle>Business catalogue, stock and barcode readiness — mirrors web `/dashboard/worker/products`.</Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>{item.name}</Text>
            <Text style={{ fontSize: 12 }}>
              R{item.price.toFixed(2)} · {item.stockQuantity} in stock
              {item.productBarcode ? ` · ${item.productBarcode}` : ""}
            </Text>
            <StatusPill label={item.status ?? item.category} tone={item.stockQuantity > 0 ? "success" : "neutral"} />
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No products assigned to your business yet.</Text> : null}
      />
    </Screen>
  );
}
