import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import {
  createWorkerStaffPurchase,
  getWorkerDashboard,
  listWorkerMallProducts,
  listWorkerMallPurchases,
} from "@/lib/api";
import { convertZarToUsd, formatMoney, useLocalization } from "@/lib/localization";
import { normalizeList, type Product, type TuckShopPurchase, type WorkerDashboardStats } from "@/lib/types";
import { useAuth } from "@/store/auth-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function WorkerStaffMallScreen() {
  const { user } = useAuth();
  const localization = useLocalization();
  const showMoney = (zar: number) =>
    formatMoney(localization.currency === "USD" ? convertZarToUsd(zar, localization.usdToZarRate) : zar, localization.currency);
  const [products, setProducts] = useState<Product[]>([]);
  const [dashboard, setDashboard] = useState<WorkerDashboardStats | null>(null);
  const [mine, setMine] = useState<TuckShopPurchase[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [page, dash, owned] = await Promise.all([
        listWorkerMallProducts({ size: 50, search: search.trim() || undefined }),
        getWorkerDashboard().catch(() => null),
        listWorkerMallPurchases().catch(() => [] as TuckShopPurchase[]),
      ]);
      setProducts(normalizeList(page));
      if (dash) setDashboard(dash);
      setMine(Array.isArray(owned) ? owned : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load the staff mall.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  const staffPercent = Number(dashboard?.staffDiscountPercentage ?? user?.staffDiscountPercentage ?? 0);
  const staffEnabled = staffPercent > 0;

  function quantityFor(productId: number) {
    return Math.max(1, quantities[productId] ?? 1);
  }

  async function buyAtStaffPrice(product: Product) {
    if (!staffEnabled) {
      setError("No staff discount is set for this worker. Ask the business owner to set a staff % (0–90).");
      return;
    }
    setBuyingId(product.id);
    setError(null);
    setNotice(null);
    try {
      const result = await createWorkerStaffPurchase({
        items: [{ productId: product.id, quantity: quantityFor(product.id) }],
      });
      setNotice(`Staff order #${result.transactionId} · ${showMoney(Number(result.netTotal ?? result.productTotal ?? 0))} at staff price.`);
      const owned = await listWorkerMallPurchases().catch(() => [] as TuckShopPurchase[]);
      setMine(Array.isArray(owned) ? owned : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Staff purchase failed.");
    } finally {
      setBuyingId(null);
    }
  }

  return (
    <Screen>
      <Title>Staff Mall</Title>
      <Subtitle>
        {staffEnabled
          ? `Staff price active · ${staffPercent}% off sale prices — mirrors web /dashboard/worker/mall.`
          : "Browse the mall — ask your owner for a staff % to unlock staff price."}
      </Subtitle>
      <ErrorText message={error} />
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}

      <Card>
        <Text style={{ fontWeight: "800" }}>My staff orders ({mine.length})</Text>
        {mine.slice(0, 5).map((purchase) => (
          <Text key={purchase.transactionId} style={styles.meta}>
            Order #{purchase.transactionId} · {purchase.items?.length ?? 0} items ·{" "}
            {showMoney(Number(purchase.netTotal ?? purchase.productTotal ?? 0))}
          </Text>
        ))}
        <Link href="/(tabs)/worker-tickets" style={styles.link}>
          Browse tickets →
        </Link>
      </Card>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search staff mall…"
        style={styles.input}
        onSubmitEditing={() => void load()}
      />

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => {
          const qty = quantityFor(item.id);
          const sale = Number(item.salePrice ?? item.price ?? 0);
          const staff = item.staffPrice != null ? Number(item.staffPrice) : NaN;
          const hasStaff = staffEnabled && Number.isFinite(staff) && staff < sale;
          return (
            <Card>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>
                    {item.businessName ?? "Tuck shop"} · {item.stockQuantity} in stock
                  </Text>
                  <Text style={styles.price}>
                    {showMoney(hasStaff ? staff : sale)}{" "}
                    {hasStaff ? <Text style={styles.was}>{showMoney(sale)}</Text> : null}
                  </Text>
                  {item.returnableEnabled ? (
                    <Text style={styles.returnable}>
                      Returnable · {showMoney(Number(item.returnablePrice ?? 0))} deposit each
                    </Text>
                  ) : null}
                </View>
                <View style={{ gap: 6, alignItems: "flex-end" }}>
                  <StatusPill label={item.category} />
                  {hasStaff ? <StatusPill label={`STAFF ${staffPercent}%`} tone="action" /> : null}
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.qtyRow}>
                  <Text
                    style={styles.qtyBtn}
                    onPress={() => setQuantities((c) => ({ ...c, [item.id]: Math.max(1, qty - 1) }))}
                  >
                    −
                  </Text>
                  <Text style={styles.qty}>{qty}</Text>
                  <Text
                    style={styles.qtyBtn}
                    onPress={() => setQuantities((c) => ({ ...c, [item.id]: qty + 1 }))}
                  >
                    +
                  </Text>
                </View>
                <PrimaryButton
                  title={buyingId === item.id ? "…" : hasStaff ? `Buy ${showMoney(staff)}` : `Buy ${showMoney(sale)}`}
                  onPress={() => void buyAtStaffPrice(item)}
                  disabled={buyingId === item.id || !staffEnabled || item.stockQuantity <= 0}
                />
              </View>
            </Card>
          );
        }}
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
  price: { color: tokens.ink, fontSize: 16, fontWeight: "900" },
  was: { color: tokens.steel, fontSize: 12, fontWeight: "600", textDecorationLine: "line-through" },
  returnable: { color: tokens.confirm, fontSize: 12, fontWeight: "800" },
  link: { color: tokens.signalStrong, fontWeight: "800" },
  notice: { color: tokens.confirm, fontSize: 13, fontWeight: "700" },
  empty: { color: tokens.steel, textAlign: "center", marginTop: 16 },
  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: { fontSize: 22, fontWeight: "900", color: tokens.signalStrong, paddingHorizontal: 8 },
  qty: { fontSize: 15, fontWeight: "900", color: tokens.ink, minWidth: 24, textAlign: "center" },
});
