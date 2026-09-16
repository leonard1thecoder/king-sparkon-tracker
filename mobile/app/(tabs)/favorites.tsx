import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { listFavoriteDetailed } from "@/lib/api";
import type { FavoriteBusiness } from "@/lib/types";
import { useFavorites } from "@/store/favorites-context";
import { Card, ErrorText, PrimaryButton, Screen, Subtitle, Title } from "@/components/ui";

export default function FavoritesScreen() {
  const { keys, toggle, refresh } = useFavorites();
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
      <Subtitle>Businesses you favorited — mirrors web `/dashboard/user/favorites`. Tap the heart in the shop to add or remove.</Subtitle>
      <ErrorText message={error} />
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
