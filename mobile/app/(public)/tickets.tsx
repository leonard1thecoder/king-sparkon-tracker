import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { router } from "expo-router";
import { listTicketEvents } from "@/lib/api";
import type { TicketEvent } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

// Guest mirror of the user Tickets tab — same event view, but buying
// requires sign-in (member ticket list is skipped for guests).
export default function PublicTicketsScreen() {
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const live = await listTicketEvents();
      setEvents(Array.isArray(live) ? live : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Buy tickets</Title>
      <Subtitle>Browse live events — mirrors web `/dashboard/user/tickets/buy`.</Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={events}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "800", fontSize: 15 }}>{item.name}</Text>
              <StatusPill label={item.status} tone={item.status === "PUBLISHED" ? "success" : "neutral"} />
            </View>
            <Text style={{ fontSize: 12 }}>
              {item.venue ?? "Venue TBA"} · {item.eventDate} {item.eventTime}
            </Text>
            {item.ticketTypes.map((type) => (
              <Text key={type.type} style={{ fontSize: 12 }}>
                {type.type}: R{Number(type.price).toFixed(2)} · {type.available} left
              </Text>
            ))}
            <PrimaryButton title="Get tickets" onPress={() => router.replace("/(auth)/login")} />
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No live events right now.</Text> : null}
      />
    </Screen>
  );
}
