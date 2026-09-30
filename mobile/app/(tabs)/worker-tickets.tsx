import { useCallback, useEffect, useState } from "react";
import { FlatList, Linking, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import {
  createWorkerTicketPurchase,
  listMyTickets,
  listTicketEvents,
  listWorkerMyTickets,
  listWorkerTicketEvents,
} from "@/lib/api";
import { convertZarToUsd, formatMoney, useLocalization } from "@/lib/localization";
import type { TicketEvent, UserTicket } from "@/lib/types";
import { useAuth } from "@/store/auth-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

const TICKET_TYPES = ["REGULAR", "VIP", "VVIP"] as const;

export default function WorkerTicketsScreen() {
  const { user } = useAuth();
  const localization = useLocalization();
  const showMoney = (zar: number) =>
    formatMoney(localization.currency === "USD" ? convertZarToUsd(zar, localization.usdToZarRate) : zar, localization.currency);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [mine, setMine] = useState<UserTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [buyingEventId, setBuyingEventId] = useState<string | null>(null);
  const [ticketType, setTicketType] = useState<(typeof TICKET_TYPES)[number]>("REGULAR");
  const [quantity, setQuantity] = useState("1");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [live, owned] = await Promise.all([
        listWorkerTicketEvents().catch(() => listTicketEvents()),
        listWorkerMyTickets().catch(() => listMyTickets().catch(() => [] as UserTicket[])),
      ]);
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

  async function buyTickets(event: TicketEvent) {
    if (!user) {
      setError("Sign in as a worker to buy tickets.");
      return;
    }
    const qty = Math.max(1, Number.parseInt(quantity, 10) || 1);
    setBuyingEventId(event.id);
    setError(null);
    setNotice(null);
    setPaymentUrl(null);
    try {
      const result = await createWorkerTicketPurchase({
        eventId: event.id,
        userId: String(user.id),
        buyerName: user.username,
        buyerEmail: user.emailAddress,
        ticketType,
        quantity: qty,
      });
      const url = result.payment?.paymentUrl ?? null;
      setPaymentUrl(url);
      setNotice(
        `Reserved ${qty} ${ticketType} ticket${qty === 1 ? "" : "s"} for ${event.name} · ` +
          `${showMoney(Number(result.payment?.totalAmount ?? 0))} — complete payment to confirm.`,
      );
      const owned = await listWorkerMyTickets().catch(() => [] as UserTicket[]);
      setMine(Array.isArray(owned) ? owned : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Ticket purchase failed.");
    } finally {
      setBuyingEventId(null);
    }
  }

  return (
    <Screen>
      <Title>Tickets</Title>
      <Subtitle>Browse events and keep your tickets — mirrors web /dashboard/worker/tickets.</Subtitle>
      <ErrorText message={error} />
      {notice ? <Text style={styles.notice}>{notice}</Text> : null}
      {paymentUrl ? (
        <Card>
          <Text style={{ fontWeight: "800" }}>Complete payment</Text>
          <Text style={styles.meta}>PayFast checkout opens in the browser.</Text>
          <PrimaryButton title="Pay in browser" onPress={() => void Linking.openURL(paymentUrl)} />
        </Card>
      ) : null}

      <Card>
        <Text style={{ fontWeight: "800" }}>My tickets ({mine.length})</Text>
        {mine.slice(0, 5).map((ticket) => (
          <Text key={ticket.id} style={styles.meta}>
            {ticket.eventName ?? ticket.eventId} · {ticket.ticketType} · {ticket.status ?? "PENDING"}
          </Text>
        ))}
      </Card>

      <Card>
        <Text style={{ fontWeight: "800" }}>Buy for an event</Text>
        <Text style={styles.meta}>Ticket class</Text>
        <View style={styles.typeRow}>
          {TICKET_TYPES.map((type) => (
            <Text
              key={type}
              onPress={() => setTicketType(type)}
              style={[styles.typeChip, ticketType === type && styles.typeChipActive]}
            >
              {type}
            </Text>
          ))}
        </View>
        <Text style={styles.meta}>Quantity</Text>
        <TextInput
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="numeric"
          placeholder="1"
          style={styles.input}
        />
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
            <Text style={styles.meta}>
              {item.venue ?? "Venue TBA"} · {item.eventDate} {item.eventTime}
            </Text>
            {item.ticketTypes.map((type) => (
              <Text key={type.type} style={styles.meta}>
                {type.type}: {showMoney(Number(type.price))} · {type.available} left
              </Text>
            ))}
            <PrimaryButton
              title={buyingEventId === item.id ? "Reserving…" : `Buy ${ticketType} × ${quantity || "1"}`}
              onPress={() => void buyTickets(item)}
              disabled={buyingEventId === item.id}
            />
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No live events right now.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  meta: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  notice: { color: tokens.confirm, fontSize: 13, fontWeight: "700" },
  input: {
    backgroundColor: "#fff",
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: tokens.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: tokens.ink,
  },
  typeRow: { flexDirection: "row", gap: 8 },
  typeChip: {
    borderWidth: 1,
    borderColor: tokens.line,
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    fontWeight: "800",
    fontSize: 12,
    color: tokens.steel,
    overflow: "hidden",
  },
  typeChipActive: { backgroundColor: tokens.signalSoft, borderColor: tokens.signal, color: tokens.signalStrong },
});
