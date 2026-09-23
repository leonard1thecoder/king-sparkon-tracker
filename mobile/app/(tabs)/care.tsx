import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import {
  listBasicCarePlans,
  listBusinessCarePlans,
  listPerformanceCarePlans,
  type RawCarePlan,
  type ServiceLineKind,
} from "@/lib/api";
import { useCart } from "@/store/cart-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

type CareTab = { id: "basic" | "performance" | "business"; label: string; kind: ServiceLineKind; detail: string };

const CARE_TABS: CareTab[] = [
  { id: "basic", label: "Basic Care", kind: "BASIC_CARE", detail: "OS installs, drivers and software." },
  { id: "performance", label: "Performance", kind: "PERFORMANCE_CARE", detail: "CPU, RAM and GPU upgrades." },
  { id: "business", label: "Business", kind: "BUSINESS_CARE", detail: "Bulk device servicing." },
];

function headlineFor(tab: CareTab["id"], plan: RawCarePlan): string {
  if (tab === "basic") return plan.operationSystemDisplayName || "Basic Care plan";
  if (tab === "performance")
    return plan.deviceTypeDisplayName ? `${plan.deviceTypeDisplayName} performance upgrade` : "Performance Care plan";
  return plan.bulkTypeDisplayName || "Business Care plan";
}

function detailFor(tab: CareTab["id"], plan: RawCarePlan): string {
  if (tab === "business") {
    const parts = [
      plan.quantity != null ? `${plan.quantity} device${plan.quantity === 1 ? "" : "s"}` : "",
      plan.unitPrice != null ? `R${Number(plan.unitPrice).toFixed(2)} each` : "",
    ].filter(Boolean);
    return parts.join(" · ");
  }
  if (tab === "performance" && plan.appliedUpgradePrice != null) {
    return `Applied upgrade R${Number(plan.appliedUpgradePrice).toFixed(2)}`;
  }
  return "";
}

export default function CareScreen() {
  const { addService } = useCart();
  const [tab, setTab] = useState<CareTab>(CARE_TABS[0]);
  const [plans, setPlans] = useState<RawCarePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows =
        tab.id === "basic"
          ? await listBasicCarePlans()
          : tab.id === "performance"
            ? await listPerformanceCarePlans()
            : await listBusinessCarePlans();
      setPlans(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setPlans([]);
      setError(e instanceof Error ? e.message : "Could not load care plans.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Computer Care</Title>
      <Subtitle>Service plan quotes — mirrors web computer care. Add a quote to the shared cart to pay it.</Subtitle>
      <View style={styles.tabRow}>
        {CARE_TABS.map((entry) => (
          <Pressable
            key={entry.id}
            onPress={() => {
              setTab(entry);
              setAddedId(null);
            }}
            style={[styles.tab, entry.id === tab.id && styles.tabActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: entry.id === tab.id }}
          >
            <Text style={[styles.tabText, entry.id === tab.id && styles.tabTextActive]}>{entry.label}</Text>
          </Pressable>
        ))}
      </View>
      <Text style={styles.meta}>{tab.detail}</Text>
      <ErrorText message={error} />
      <FlatList
        data={plans}
        keyExtractor={(item) => `${tab.id}-${item.id}`}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{headlineFor(tab.id, item)}</Text>
                {detailFor(tab.id, item) ? <Text style={styles.meta}>{detailFor(tab.id, item)}</Text> : null}
              </View>
              <StatusPill label={item.statusDisplayName ?? `Status ${item.status ?? "-"}`} tone="neutral" />
            </View>
            <Text style={styles.total}>R{Number(item.totalQuote).toFixed(2)}</Text>
            <View style={styles.row}>
              <PrimaryButton
                title={addedId === item.id ? "Added ✓" : "Add quote to cart"}
                onPress={() => {
                  addService({
                    serviceKind: tab.kind,
                    referenceId: String(item.id),
                    label: `${tab.label} #${item.id}`,
                    price: Number(item.totalQuote),
                  });
                  setAddedId(item.id);
                }}
              />
              <Link href="/(tabs)/cart" style={styles.cartLink}>
                Cart →
              </Link>
            </View>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.meta}>No {tab.label.toLowerCase()} plans found.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  tabRow: { flexDirection: "row", gap: 8 },
  tab: { flex: 1, borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 10, alignItems: "center", backgroundColor: "#fff" },
  tabActive: { backgroundColor: tokens.ink, borderColor: tokens.ink },
  tabText: { fontWeight: "800", fontSize: 13, color: tokens.ink },
  tabTextActive: { color: "#fff" },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  name: { color: tokens.ink, fontWeight: "800", fontSize: 15 },
  meta: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  total: { color: tokens.ink, fontWeight: "900", fontSize: 18 },
  cartLink: { color: tokens.signalStrong, fontWeight: "800" },
});
