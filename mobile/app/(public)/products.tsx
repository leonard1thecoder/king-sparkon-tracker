import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { listTuckShopProducts } from "@/lib/api";
import { DEMO_NOTICE, demoProducts } from "@/lib/demo-data";
import { normalizeList, type Product } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

// Guest mirror of the user Shop tab — same product view, but every
// action redirects to the sign-in screen.
export default function PublicProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listTuckShopProducts({ size: 50, search: search.trim() || undefined });
      setProducts(normalizeList(result));
      setDemo(false);
    } catch {
      setProducts(demoProducts(search));
      setDemo(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const goSignIn = useCallback(() => {
    router.replace("/(auth)/login");
  }, []);

  return (
    <Screen>
      <Title>Buy products</Title>
      <Subtitle>Browse business catalogues and checkout — mirrors web `/dashboard/user/shop`.</Subtitle>
      {demo ? <Text style={styles.demoNote}>{DEMO_NOTICE}</Text> : null}
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
              <Pressable onPress={goSignIn} accessibilityRole="button" accessibilityLabel="Sign in to view details">
                <Text style={styles.details}>Details</Text>
              </Pressable>
              <PrimaryButton title="Add" onPress={goSignIn} />
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
  demoNote: { color: tokens.steel, fontSize: 12, fontWeight: "700" },
  empty: { color: tokens.steel, textAlign: "center", marginTop: 16 },
});
