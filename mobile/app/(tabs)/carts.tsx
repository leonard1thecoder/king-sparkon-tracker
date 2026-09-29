import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";
import { createReturnableRefund, listMyPurchases, listMyRefunds, listMyReturnableRefunds, requestProductRefund } from "@/lib/api";
import type { RefundRequest, ReturnableRefund, TuckShopPurchase } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function MyCartsScreen() {
  const [purchases, setPurchases] = useState<TuckShopPurchase[]>([]);
  const [refunds, setRefunds] = useState<ReturnableRefund[]>([]);
  const [purchaseRefunds, setPurchaseRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refundQty, setRefundQty] = useState<Record<string, number>>({});
  const [refundBusy, setRefundBusy] = useState<string | null>(null);
  const [refundNote, setRefundNote] = useState<string | null>(null);
  const [purchaseRefundBusy, setPurchaseRefundBusy] = useState<string | null>(null);
  const [purchaseRefundConfirm, setPurchaseRefundConfirm] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listMyPurchases();
      setPurchases(Array.isArray(rows) ? rows : []);
      try {
        const refundRows = await listMyReturnableRefunds();
        setRefunds(Array.isArray(refundRows) ? refundRows : []);
      } catch {
        setRefunds([]);
      }
      try {
        const purchaseRefundRows = await listMyRefunds();
        setPurchaseRefunds(Array.isArray(purchaseRefundRows) ? purchaseRefundRows.filter((refund) => refund.kind === "PRODUCT_ITEM") : []);
      } catch {
        setPurchaseRefunds([]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load purchase history.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function purchaseRefundForItem(transactionId: number, itemId?: number) {
    return purchaseRefunds.find(
      (refund) =>
        refund.transactionId === transactionId &&
        refund.transactionItemId === itemId &&
        (refund.status === "REQUESTED" || refund.status === "APPROVED"),
    );
  }

  async function submitPurchaseRefund(transactionId: number, itemId: number) {
    const key = `${transactionId}:${itemId}`;
    setPurchaseRefundBusy(key);
    setRefundNote(null);
    try {
      await requestProductRefund({ transactionId, transactionItemId: itemId });
      setPurchaseRefundConfirm(null);
      const refundRows = await listMyRefunds().catch(() => []);
      setPurchaseRefunds(Array.isArray(refundRows) ? refundRows.filter((refund) => refund.kind === "PRODUCT_ITEM") : []);
      setRefundNote("Purchase refund requested — the counter pays out after staff approval.");
    } catch (e) {
      setRefundNote(e instanceof Error ? e.message : "Refund request failed.");
    } finally {
      setPurchaseRefundBusy(null);
    }
  }

  function refundsForItem(transactionId: number, itemId?: number) {
    return refunds.filter((refund) => refund.transactionId === transactionId && refund.transactionItemId === itemId);
  }

  function reservedQty(transactionId: number, itemId?: number) {
    return refundsForItem(transactionId, itemId)
      .filter((refund) => refund.status === "REQUESTED" || refund.status === "APPROVED")
      .reduce((sum, refund) => sum + refund.quantity, 0);
  }

  async function submitRefund(transactionId: number, itemId: number, maxQty: number, deposit: number) {
    const key = `${transactionId}:${itemId}`;
    const quantity = Math.min(Math.max(refundQty[key] ?? maxQty, 1), maxQty);
    setRefundBusy(key);
    setRefundNote(null);
    try {
      await createReturnableRefund({ transactionId, transactionItemId: itemId, quantity });
      setRefundQty((current) => ({ ...current, [key]: 1 }));
      const refundRows = await listMyReturnableRefunds().catch(() => []);
      setRefunds(Array.isArray(refundRows) ? refundRows : []);
      setRefundNote(`Refund requested: ${quantity} empties · R${(deposit * quantity).toFixed(2)} cash after worker approval.`);
    } catch (e) {
      setRefundNote(e instanceof Error ? e.message : "Refund request failed.");
    } finally {
      setRefundBusy(null);
    }
  }

  return (
    <Screen>
      <Title>My carts</Title>
      <Subtitle>Review product purchases and collections — mirrors web `/dashboard/user/carts`.</Subtitle>
      <ErrorText message={error} />
      {refundNote ? <StatusPill label={refundNote} tone="action" /> : null}
      <FlatList
        data={purchases}
        keyExtractor={(item) => String(item.transactionId)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800" }}>
              Order {item.transactionId} · R{(item.netTotal ?? item.productTotal).toFixed(2)}
            </Text>
            {(item.emptiesCreditTotal ?? 0) > 0 ? (
              <Text style={{ fontSize: 12, fontWeight: "800", color: "#1C7C54" }}>
                Empties credit −R{(item.emptiesCreditTotal ?? 0).toFixed(2)}
              </Text>
            ) : null}
            <StatusPill label={item.fulfilmentStatus ?? item.paymentStatus ?? "PENDING"} tone="action" />
            {item.items.map((line) => {
              const deposit = Number(line.depositUnitPrice ?? 0);
              const itemRefunds = refundsForItem(item.transactionId, line.transactionItemId);
              const refundable =
                deposit > 0
                  ? Math.max(line.quantity - Number(line.emptiesReturned ?? 0) - reservedQty(item.transactionId, line.transactionItemId), 0)
                  : 0;
              const key = `${item.transactionId}:${line.transactionItemId ?? 0}`;
              const wanted = Math.min(Math.max(refundQty[key] ?? refundable, 1), Math.max(refundable, 1));
              const existingRefund = purchaseRefundForItem(item.transactionId, line.transactionItemId);
              const netPaid = Number(line.netLineTotal ?? line.lineTotal ?? 0);
              const fee = Math.round(netPaid * 7) / 100;
              const payout = netPaid - fee;
              const canRequestRefund =
                line.transactionItemId != null &&
                !line.refunded &&
                item.fulfilmentStatus !== "COLLECTED" &&
                item.paymentStatus !== "PENDING" &&
                item.paymentStatus !== "FAILED" &&
                !existingRefund;
              return (
                <View key={line.transactionItemId ?? line.productId}>
                  <Text style={{ fontSize: 12 }}>
                    {line.productName} × {line.quantity} — R{line.lineTotal.toFixed(2)}
                    {(line.emptiesReturned ?? 0) > 0 ? ` · ${line.emptiesReturned} empties back` : ""}
                  </Text>
                  {deposit > 0 ? (
                    <Text style={{ fontSize: 12, fontWeight: "800", color: "#1C7C54" }}>
                      Returnable · R{deposit.toFixed(2)} deposit each
                    </Text>
                  ) : null}
                  {itemRefunds.map((refund) => (
                    <Text key={refund.id} style={{ fontSize: 12 }}>
                      Refund #{refund.id} · {refund.quantity} empties · R{refund.amount.toFixed(2)} ·{" "}
                      {refund.status === "REQUESTED" ? "awaiting worker approval" : null}
                      {refund.status === "APPROVED" ? "approved · collect cash at the counter" : null}
                      {refund.status === "REJECTED" ? `rejected${refund.rejectReason ? ` · ${refund.rejectReason}` : ""}` : null}
                    </Text>
                  ))}
                  {deposit > 0 && refundable > 0 && line.transactionItemId ? (
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <PrimaryButton title="−" onPress={() => setRefundQty((current) => ({ ...current, [key]: Math.max((current[key] ?? refundable) - 1, 1) }))} />
                      <Text style={{ fontSize: 12 }}>
                        {wanted} of {refundable} · R{(deposit * wanted).toFixed(2)}
                      </Text>
                      <PrimaryButton title="+" onPress={() => setRefundQty((current) => ({ ...current, [key]: Math.min((current[key] ?? refundable) + 1, refundable) }))} />
                      <PrimaryButton
                        title={refundBusy === key ? "…" : "Request"}
                        onPress={() => void submitRefund(item.transactionId, line.transactionItemId as number, refundable, deposit)}
                        disabled={refundBusy === key}
                      />
                    </View>
                  ) : null}
                  {line.refunded ? (
                    <Text style={{ fontSize: 12, fontWeight: "800" }}>Refunded in full</Text>
                  ) : existingRefund ? (
                    <Text style={{ fontSize: 12 }}>
                      Purchase refund #{existingRefund.id} · R{existingRefund.netAmount.toFixed(2)} ·{" "}
                      {existingRefund.status === "REQUESTED" ? "awaiting staff approval" : null}
                      {existingRefund.status === "APPROVED" ? "approved · cash paid out" : null}
                      {existingRefund.status === "REJECTED" ? `rejected${existingRefund.rejectReason ? ` · ${existingRefund.rejectReason}` : ""}` : null}
                    </Text>
                  ) : canRequestRefund ? (
                    <View style={{ flexDirection: "row", gap: 8, alignItems: "center", marginTop: 4 }}>
                      <Text style={{ fontSize: 12 }}>
                        Refund full line · get R{payout.toFixed(2)} after R{fee.toFixed(2)} fee
                      </Text>
                      {purchaseRefundConfirm === key ? (
                        <>
                          <PrimaryButton
                            title={purchaseRefundBusy === key ? "…" : "Confirm"}
                            onPress={() => void submitPurchaseRefund(item.transactionId, line.transactionItemId as number)}
                            disabled={purchaseRefundBusy === key}
                          />
                          <PrimaryButton title="Cancel" onPress={() => setPurchaseRefundConfirm(null)} />
                        </>
                      ) : (
                        <PrimaryButton title="Request refund" onPress={() => setPurchaseRefundConfirm(key)} />
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No completed carts yet.</Text> : null}
      />
    </Screen>
  );
}
