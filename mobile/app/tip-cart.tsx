import { FlatList, RefreshControl, Text } from "react-native";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useTipTray } from "@/store/tip-tray-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { useState } from "react";

// Tip cart — pay unpaid worker tips added from QR scans.
// Mirrors web `/dashboard/user/tips/cart`.
export default function TipCartScreen() {
  const { lines, total, loading, refresh, remove, clear } = useTipTray();
  const [error, setError] = useState<string | null>(null);

  async function pay(reference: string | null | undefined, url: string | null | undefined) {
    if (url) {
      await WebBrowser.openBrowserAsync(url);
      return;
    }
    setError(reference ? `No payment URL for ${reference} yet — refresh and try again.` : "No payment URL for this tip yet.");
  }

  return (
    <Screen>
      <Title>Tip cart</Title>
      <Subtitle>Scan a worker QR, set an amount, submit it here, and pay. {lines.length > 0 ? `Total R${total.toFixed(2)}.` : ""}</Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={lines}
        keyExtractor={(item) => String(item.tipId)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void refresh()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>{item.workerLabel}</Text>
            <Text style={{ fontWeight: "800", fontSize: 18 }}>R{item.tipAmount.toFixed(2)}</Text>
            <StatusPill label={item.paymentReference ? `#${item.tipId} · ${item.paymentReference}` : `#${item.tipId}`} tone="action" />
            <PrimaryButton title="Pay" onPress={() => void pay(item.paymentReference, item.paymentUrl)} />
            <PrimaryButton title="Remove" onPress={() => void remove(item.tipId)} />
          </Card>
        )}
        ListEmptyComponent={
          !loading ? (
            <Card>
              <Text style={{ fontWeight: "800" }}>Tip cart is empty</Text>
              <Text>Scan a worker QR, set an amount, and add the tip to pay here.</Text>
              <Link href="/(tabs)/tips" style={{ color: "#C93316", fontWeight: "800" }}>
                Scan worker QR →
              </Link>
            </Card>
          ) : null
        }
      />
      {lines.length > 0 ? <PrimaryButton title="Clear cart" onPress={() => void clear()} /> : null}
    </Screen>
  );
}
