import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { router } from "expo-router";
import { listFavoriteDetailed } from "@/lib/api";
import type { FavoriteBusiness } from "@/lib/types";
import { useFavorites } from "@/store/favorites-context";
import { Card, ErrorText, PrimaryButton, Screen, Subtitle, Title } from "@/components/ui";

export default function FavoritesScreen() {
  const { keys, toggle, refresh, workerFavorites, toggleWorkerFavorite } = useFavorites();
  const [detailed, setDetailed] = useState<FavoriteBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listFavoriteDetailed();
      setDetailed(Array.isArray(rows) ? rows : []);
    } catch {
      // Backend detailed view unavailable — fall back to cached keys (web parity).
      setDetailed(keys.map((key) => ({ key, businessName: key })));
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [keys]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = detailed.length > 0 ? detailed : keys.map((key) => ({ key, businessName: key }));

  return (
    <Screen>
      <Title>Favorites</Title>
      <Subtitle>Businesses and workers you favorited — mirrors web `/dashboard/user/favorites`. Tap the heart in the shop or tip tab to add or remove.</Subtitle>
      <ErrorText message={error} />
      <Title>Favorite workers</Title>
      {workerFavorites.length === 0 ? (
        <Text>None yet. Tap the heart on any worker in the Tip tab to save them here.</Text>
      ) : null}
      {workerFavorites.map((worker) => (
        <Card key={`${worker.businessId ?? "any"}:${worker.workerId}`}>
          <Text style={{ fontWeight: "800", fontSize: 15 }}>{worker.username}</Text>
          <Text style={{ fontSize: 12 }}>
            {worker.jobTitle || "Worker"}{worker.businessName ? ` · ${worker.businessName}` : ""}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <PrimaryButton
              title="Tip worker"
              onPress={() => router.push({ pathname: "/(tabs)/tips", params: { workerId: String(worker.workerId) } })}
            />
            <PrimaryButton title="Remove" onPress={() => void toggleWorkerFavorite(worker)} />
          </View>
        </Card>
      ))}
      <Title>Favorite businesses</Title>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.key}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => { void refresh(); void load(); }} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>{item.businessName}</Text>
            <Text style={{ fontSize: 12 }}>{item.key}</Text>
            <PrimaryButton title="Remove" onPress={() => void toggle(item.key)} />
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No favorites yet. Tap the heart on any business to favorite it.</Text> : null}
      />
    </Screen>
  );
}
