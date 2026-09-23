import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { addTicketCoolerbox, listMyTickets, listTicketEvents } from "@/lib/api";
import type { TicketEvent, UserTicket } from "@/lib/types";
import { useCart } from "@/store/cart-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function TicketsScreen() {
  const { addService } = useCart();
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [mine, setMine] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [live, owned] = await Promise.all([listTicketEvents(), listMyTickets().catch(() => [])]);
      setEvents(Array.isArray(live) ? live : []);
      setMine(Array.isArray(owned) ? owned : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addFreeCoolerbox(ticketId: string) {
    setError(null);
    try {
      await addTicketCoolerbox(ticketId);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add coolerbox.");
    }
  }

  function addPricedCoolerbox(ticket: UserTicket, event: TicketEvent) {
    const price = Number(event.coolerboxPrice ?? NaN);
    if (!Number.isFinite(price) || price <= 0) {
      setError("This event has no priced coolerbox to add.");
      return;
    }
    addService({
      serviceKind: "COOLER_BOX",
      referenceId: ticket.id,
      label: `Coolerbox — ${event.name}`,
      price,
    });
    router.push("/(tabs)/cart");
  }

  return (
    <Screen>
      <Title>Buy tickets</Title>
      <Subtitle>Browse live events — mirrors web `/dashboard/user/tickets/buy`.</Subtitle>
      <ErrorText message={error} />
      <Card>
        <Text style={{ fontWeight: "800" }}>My tickets ({mine.length})</Text>
        {mine.slice(0, 5).map((ticket) => {
          const event = events.find((candidate) => candidate.id === ticket.eventId);
          const offered = event != null && (event.coolerboxFree === true || event.coolerboxPrice != null);
          const added = ticket.coolerboxAdded === true;
          return (
            <View key={ticket.id} style={{ gap: 4 }}>
              <Text style={{ fontSize: 12 }}>
                {ticket.eventName ?? ticket.eventId} · {ticket.ticketType}
                {added ? " · Coolerbox ✓" : ""}
              </Text>
              {offered && !added ? (
                event.coolerboxFree ? (
                  <PrimaryButton title="Add free coolerbox" onPress={() => void addFreeCoolerbox(ticket.id)} />
                ) : (
                  <PrimaryButton
                    title={`Add coolerbox R${Number(event?.coolerboxPrice ?? 0).toFixed(2)} to cart`}
                    onPress={() => event && addPricedCoolerbox(ticket, event)}
                  />
                )
              ) : null}
            </View>
          );
        })}
        <Link href="/(tabs)/cart" style={{ color: "#C93316", fontWeight: "800" }}>
          Open cart →
        </Link>
      </Card>
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
            {item.marketplaceHubEnabled ? (
              <View style={{ gap: 8 }}>
                <StatusPill
                  label={`Marketplace Hub${item.marketplaceHubPrice != null ? ` · R${Number(item.marketplaceHubPrice).toFixed(2)}` : ""}`}
                  tone="action"
                />
                {item.businessId != null ? (
                  <PrimaryButton
                    title="Shop hub products"
                    onPress={() =>
                      router.push({ pathname: "/(tabs)/shop", params: { businessId: String(item.businessId) } })
                    }
                  />
                ) : null}
              </View>
            ) : null}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No live events right now.</Text> : null}
      />
    </Screen>
  );
}
