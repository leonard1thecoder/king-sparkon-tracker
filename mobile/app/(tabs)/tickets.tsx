import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { addTicketCoolerbox, listMyRefunds, listMyTickets, listTicketEvents, requestTicketRefund } from "@/lib/api";
import { convertZarToUsd, formatMoney, useLocalization } from "@/lib/localization";
import type { RefundRequest, TicketEvent, UserTicket } from "@/lib/types";
import { useCart } from "@/store/cart-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

function hoursUntilEvent(event: TicketEvent | undefined) {
  if (!event) return NaN;
  const startsAt = new Date(`${event.eventDate}T${event.eventTime || "00:00"}`).getTime();
  if (!Number.isFinite(startsAt)) return NaN;
  return (startsAt - Date.now()) / 3_600_000;
}

export default function TicketsScreen() {
  const { addService } = useCart();
  const localization = useLocalization();
  const showMoney = (zar: number) =>
    formatMoney(localization.currency === "USD" ? convertZarToUsd(zar, localization.usdToZarRate) : zar, localization.currency);
  const [events, setEvents] = useState<TicketEvent[]>([]);
  const [mine, setMine] = useState<UserTicket[]>([]);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundBusy, setRefundBusy] = useState<string | null>(null);
  const [refundConfirm, setRefundConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [live, owned] = await Promise.all([listTicketEvents(), listMyTickets().catch(() => [])]);
      setEvents(Array.isArray(live) ? live : []);
      setMine(Array.isArray(owned) ? owned : []);
      try {
        const refundRows = await listMyRefunds();
        setRefunds(Array.isArray(refundRows) ? refundRows.filter((refund) => refund.kind === "TICKET") : []);
      } catch {
        setRefunds([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tickets.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function refundForTicket(ticketId: string) {
    return (
      refunds.find(
        (refund) => refund.userTicketId === ticketId && (refund.status === "REQUESTED" || refund.status === "APPROVED"),
      ) ?? refunds.find((refund) => refund.userTicketId === ticketId)
    );
  }

  async function submitTicketRefund(ticketId: string) {
    setRefundBusy(ticketId);
    setError(null);
    try {
      await requestTicketRefund({ userTicketId: ticketId });
      setRefundConfirm(null);
      const refundRows = await listMyRefunds().catch(() => []);
      setRefunds(Array.isArray(refundRows) ? refundRows.filter((refund) => refund.kind === "TICKET") : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Refund request failed.");
    } finally {
      setRefundBusy(null);
    }
  }

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
          const existingRefund = refundForTicket(ticket.id);
          const hoursLeft = hoursUntilEvent(event);
          const withinCutoff = Number.isFinite(hoursLeft) && hoursLeft < 48;
          const price = Number(ticket.pricePaid ?? 0);
          const fee = Math.round(price * 7) / 100;
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
              {ticket.status === "CANCELLED" ? (
                <Text style={{ fontSize: 12, fontWeight: "800" }}>Refunded — ticket cancelled</Text>
              ) : existingRefund ? (
                <Text style={{ fontSize: 12 }}>
                  Refund #{existingRefund.id} · R{existingRefund.netAmount.toFixed(2)} ·{" "}
                  {existingRefund.status === "REQUESTED" ? "awaiting staff approval" : null}
                  {existingRefund.status === "APPROVED" ? "approved · cash paid out" : null}
                  {existingRefund.status === "REJECTED" ? `rejected${existingRefund.rejectReason ? ` · ${existingRefund.rejectReason}` : ""}` : null}
                </Text>
              ) : ticket.status === "ACTIVE" && !withinCutoff ? (
                <View style={{ gap: 4 }}>
                  <Text style={{ fontSize: 12 }}>
                    Refund ticket · get R{(price - fee).toFixed(2)} after R{fee.toFixed(2)} fee
                  </Text>
                  {refundConfirm === ticket.id ? (
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <PrimaryButton
                        title={refundBusy === ticket.id ? "…" : "Confirm"}
                        onPress={() => void submitTicketRefund(ticket.id)}
                        disabled={refundBusy === ticket.id}
                      />
                      <PrimaryButton title="Cancel" onPress={() => setRefundConfirm(null)} />
                    </View>
                  ) : (
                    <PrimaryButton title="Request refund" onPress={() => setRefundConfirm(ticket.id)} />
                  )}
                </View>
              ) : ticket.status === "ACTIVE" && withinCutoff ? (
                <Text style={{ fontSize: 12 }}>Refunds closed — less than 48 hours before the event</Text>
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
                {type.type}: {showMoney(Number(type.price))} · {type.available} left
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
