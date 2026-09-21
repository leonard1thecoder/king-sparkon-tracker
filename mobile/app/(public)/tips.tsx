import { useCallback, useEffect, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { listBusinessWorkers, listUserBusinesses, type UserBusiness, type WorkerTipCard } from "@/lib/api";
import { DEMO_NOTICE, demoBusinesses, demoWorkers } from "@/lib/demo-data";
import { Card, ErrorText, PrimaryButton, Screen, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

// Guest mirror of the worker browser in the member Tip tab — same worker
// cards, but tipping requires sign-in.
export default function PublicTipsScreen() {
  const [businesses, setBusinesses] = useState<UserBusiness[]>([]);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [workers, setWorkers] = useState<WorkerTipCard[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBusinesses = useCallback(async () => {
    try {
      const rows = await listUserBusinesses();
      const list = Array.isArray(rows) ? rows : [];
      setBusinesses(list);
      setBusinessId((current) =>
        current !== null && list.some((business) => business.businessId === current)
          ? current
          : list.length > 0
            ? list[0].businessId
            : null,
      );
      setDemo(false);
    } catch {
      const list = demoBusinesses();
      setBusinesses(list);
      setBusinessId(list.length > 0 ? list[0].businessId : null);
      setDemo(true);
    }
  }, []);

  const loadWorkers = useCallback(async () => {
    if (businessId === null) {
      setWorkers([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await listBusinessWorkers(businessId);
      setWorkers(Array.isArray(rows) ? rows : []);
      setDemo(false);
    } catch {
      setWorkers(demoWorkers(businessId));
      setDemo(true);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    void loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    void loadWorkers();
  }, [loadWorkers]);

  const goSignIn = useCallback(() => {
    router.replace("/(auth)/login");
  }, []);

  const activeBusiness = businesses.find((business) => business.businessId === businessId) ?? null;
  const needle = query.trim().toLowerCase();
  const visibleWorkers = needle
    ? workers.filter(
        (worker) =>
          worker.username.toLowerCase().includes(needle) || (worker.jobTitle ?? "").toLowerCase().includes(needle),
      )
    : workers;

  return (
    <Screen>
      <Title>Tip worker</Title>
      <Subtitle>Find workers by business or name — mirrors the member Tip tab.</Subtitle>
      {demo ? <Text style={{ color: tokens.steel, fontSize: 12, fontWeight: "700" }}>{DEMO_NOTICE}</Text> : null}
      <View style={styles.chipRow}>
        {businesses.map((business) => (
          <Pressable
            key={business.businessId}
            onPress={() => setBusinessId(business.businessId)}
            style={[styles.chip, business.businessId === businessId && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: business.businessId === businessId }}
          >
            <Text style={[styles.chipText, business.businessId === businessId && styles.chipTextActive]}>
              {business.businessName}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput value={query} onChangeText={setQuery} placeholder="Search worker by name…" style={styles.input} />
      <ErrorText message={error} />
      <FlatList
        data={visibleWorkers}
        keyExtractor={(item) => String(item.workerId)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void loadBusinesses(); void loadWorkers(); }} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.workerRow}>
              {item.profilePictureUrl ? (
                <Image source={{ uri: item.profilePictureUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.username.trim().charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{item.username}</Text>
                <Text style={styles.workerMeta}>
                  {item.jobTitle || "Worker"}{activeBusiness ? ` · ${activeBusiness.businessName}` : ""}
                </Text>
              </View>
            </View>
            <PrimaryButton title="Tip worker" onPress={goSignIn} />
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              {workers.length === 0 ? "No workers found for this business." : "No workers match your search."}
            </Text>
          ) : null
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#fff" },
  chipActive: { backgroundColor: tokens.ink, borderColor: tokens.ink },
  chipText: { fontWeight: "800", fontSize: 13, color: tokens.ink },
  chipTextActive: { color: "#fff" },
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
  workerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: tokens.ink, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  workerName: { color: tokens.ink, fontWeight: "800", fontSize: 15 },
  workerMeta: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  empty: { color: tokens.steel, textAlign: "center", marginTop: 16 },
});
