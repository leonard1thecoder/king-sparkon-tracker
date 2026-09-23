import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Link, router, useLocalSearchParams } from "expo-router";
import { listTuckShopProducts } from "@/lib/api";
import { normalizeList, type Product } from "@/lib/types";
import { useCart } from "@/store/cart-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function ShopScreen() {
  const { add } = useCart();
  const params = useLocalSearchParams<{ businessId?: string | string[] }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [hubBusinessId, setHubBusinessId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hubPresetApplied = useRef<string | null>(null);

  useEffect(() => {
    const raw = Array.isArray(params.businessId) ? params.businessId[0] : params.businessId;
    if ((raw ?? null) === hubPresetApplied.current) return;
    hubPresetApplied.current = raw ?? null;
    if (raw == null) return;
    const parsed = Number(raw);
    if (Number.isSafeInteger(parsed) && parsed > 0) setHubBusinessId(parsed);
  }, [params.businessId]);

  function clearHubFilter() {
    hubPresetApplied.current = null;
    router.setParams({ businessId: undefined });
    setHubBusinessId(null);
  }

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTuckShopProducts({
        size: 50,
        search: search.trim() || undefined,
        businessId: hubBusinessId ?? undefined,
      });
      setProducts(normalizeList(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load products.");
    } finally {
      setLoading(false);
    }
  }, [search, hubBusinessId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Buy products</Title>
      <Subtitle>Browse business catalogues and checkout — mirrors web `/dashboard/user/shop`.</Subtitle>
      {hubBusinessId !== null ? (
        <Card>
          <Text style={{ fontWeight: "800" }}>Marketplace Hub business #{hubBusinessId}</Text>
          <Text style={styles.meta}>Showing hub products only.</Text>
          <PrimaryButton title="Clear hub filter" onPress={clearHubFilter} />
        </Card>
      ) : null}
      <TextInput value={search} onChangeText={setSearch} placeholder="Search products…" style={styles.input} onSubmitEditing={() => void load()} />
      <ErrorText message={error} />
      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>
                  {item.businessName ?? "Tuck shop"} · R{item.price.toFixed(2)} · {item.stockQuantity} in stock
                </Text>
              </View>
              <StatusPill label={item.category} />
            </View>
            <View style={styles.row}>
              <Link href={`/product/${item.id}`} style={styles.details}>
                Details
              </Link>
              <PrimaryButton title="Add" onPress={() => add({ productId: item.id, name: item.name, price: item.price })} />
            </View>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.empty}>No products found. Pull to retry.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: tokens.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: tokens.ink,
  },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  name: { color: tokens.ink, fontWeight: "800", fontSize: 15 },
  meta: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  details: { color: tokens.signalStrong, fontWeight: "800" },
  empty: { color: tokens.steel, textAlign: "center", marginTop: 16 },
});
