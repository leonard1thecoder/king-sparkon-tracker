import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { createTip, listWorkerTips } from "@/lib/api";
import type { Tip } from "@/lib/types";
import { numericWorkerId, parseWorkerTipQr, type WorkerQrResult } from "@/lib/tip-qr";
import { useAuth } from "@/store/auth-context";
import { isWorkerLike } from "@/lib/types";
import { useTipTray } from "@/store/tip-tray-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

// Unified tip flow (same as web): scan worker QR → set amount →
// submit to tip cart → pay there.
export default function TipsScreen() {
  const { user } = useAuth();
  if (isWorkerLike(user)) return <WorkerTipsPanel />;
  return <SendTipFlow />;
}

const amounts = [
  { id: "20", label: "R20", amount: 20, detail: "A small thank-you for fast service." },
  { id: "50", label: "R50", amount: 50, detail: "Reward helpful service and good attitude." },
  { id: "100", label: "R100", amount: 100, detail: "For workers who went above expectation." },
];

function SendTipFlow() {
  const { add: addToTray, count: trayCount } = useTipTray();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<WorkerQrResult | null>(null);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedTip, setAddedTip] = useState<Tip | null>(null);

  useEffect(() => {
    if (!permission?.granted) void requestPermission();
  }, [permission, requestPermission]);

  function handleScan(value: string) {
    const parsed = parseWorkerTipQr(value);
    if (!parsed) {
      setError("This QR code does not look like a worker tip QR. Scan a worker QR or enter a worker ID manually.");
      return;
    }
    setResult(parsed);
    setAddedTip(null);
    setError(null);
    setScanning(false);
  }

  const amount = selected === "custom"
    ? Number(customAmount)
    : (amounts.find((entry) => entry.id === selected)?.amount ?? 0);

  async function submitToCart() {
    if (!result) {
      setError("Scan a worker QR or enter a worker ID first.");
      return;
    }
    const backendWorkerId = numericWorkerId(result.workerId);
    if (!backendWorkerId) {
      setError("This worker QR does not contain the numeric worker ID required by the payment backend.");
      return;
    }
    if (!Number.isFinite(amount) || amount < 1) {
      setError("Choose R20, R50, R100 or a custom amount of at least R1.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const tip = await createTip({
        workerId: backendWorkerId,
        tipAmount: amount,
        callbackUrl: "kingsparkon://tips/callback",
      });
      await addToTray({
        tipId: tip.id,
        workerId: tip.workerId,
        workerLabel: `Worker ${result.workerId}`,
        tipAmount: Number(tip.tipAmount ?? amount),
        paymentReference: tip.paymentReference ?? null,
        paymentUrl: tip.paymentUrl ?? null,
        createdAt: new Date().toISOString(),
      });
      setAddedTip(tip);
      setSelected(null);
      setCustomAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tip failed.");
    } finally {
      setBusy(false);
    }
  }

  async function payNow(tip: Tip) {
    if (tip.paymentUrl) {
      await WebBrowser.openBrowserAsync(tip.paymentUrl);
    } else {
      setError("No payment URL returned yet — open the tip cart and try again.");
    }
  }

  return (
    <Screen>
      <Title>Tip worker</Title>
      <Subtitle>Scan, set an amount, submit to the tip cart, pay there — mirrors web `/dashboard/user/tips`.</Subtitle>

      <Link href="/tip-cart" style={styles.cartLink}>
        Tip cart{trayCount > 0 ? ` (${trayCount})` : ""} →
      </Link>

      {scanning && permission?.granted ? (
        <View style={styles.preview}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={(event) => handleScan(event.data)}
          />
        </View>
      ) : null}

      <Card>
        <Text style={styles.label}>Worker ID or tip URL</Text>
        <TextInput value={manual} onChangeText={setManual} autoCapitalize="none" placeholder="Scan QR or type worker ID…" style={styles.input} onSubmitEditing={() => handleScan(manual)} />
        <View style={styles.row}>
          <PrimaryButton title="Find worker" onPress={() => handleScan(manual)} />
          {!permission?.granted ? <PrimaryButton title="Enable camera" onPress={() => void requestPermission()} /> : null}
          {result ? <PrimaryButton title="Scan again" onPress={() => { setResult(null); setAddedTip(null); setScanning(true); }} /> : null}
        </View>
      </Card>

      <ErrorText message={error} />

      {result ? (
        <Card>
          <StatusPill label={`Worker ${result.workerId} · ${result.source}`} tone="success" />
          <Text style={styles.amountTitle}>Set amount</Text>
          <View style={styles.amountGrid}>
            {amounts.map((entry) => (
              <Pressable key={entry.id} onPress={() => { setSelected(entry.id); setAddedTip(null); }} style={[styles.amount, selected === entry.id && styles.amountActive]}>
                <Text style={[styles.amountLabel, selected === entry.id && styles.amountLabelActive]}>{entry.label}</Text>
                <Text style={styles.amountDetail}>{entry.detail}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => { setSelected("custom"); setAddedTip(null); }} style={[styles.amount, selected === "custom" && styles.amountActive]}>
              <Text style={[styles.amountLabel, selected === "custom" && styles.amountLabelActive]}>Custom</Text>
              <Text style={styles.amountDetail}>Enter the exact tip value.</Text>
            </Pressable>
          </View>
          {selected === "custom" ? (
            <TextInput value={customAmount} onChangeText={setCustomAmount} keyboardType="decimal-pad" placeholder="Amount in R (min 1)" style={styles.input} />
          ) : null}
          <PrimaryButton title={busy ? "Adding…" : "Add tip to cart"} onPress={() => void submitToCart()} disabled={busy} />
        </Card>
      ) : null}

      {addedTip ? (
        <Card>
          <StatusPill label="Added to tip cart" tone="success" />
          <Text>R{Number(addedTip.tipAmount ?? 0).toFixed(2)} for worker {result?.workerId}</Text>
          <View style={styles.row}>
            <PrimaryButton title="Pay now" onPress={() => void payNow(addedTip)} />
          </View>
          <Link href="/tip-cart" asChild>
            <Pressable style={styles.openCart}>
              <Text style={styles.openCartText}>Open tip cart →</Text>
            </Pressable>
          </Link>
        </Card>
      ) : null}
    </Screen>
  );
}

function WorkerTipsPanel() {
  const [tips, setTips] = useState<Tip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listWorkerTips();
      setTips(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load tips.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Tips & QR</Title>
      <Subtitle>Owner-enabled tip activity — mirrors web `/dashboard/worker/tips`.</Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={tips}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800" }}>R{item.tipAmount.toFixed(2)}</Text>
            <StatusPill label={item.status ?? "PAID"} tone="success" />
            {item.paymentReference ? <Text style={{ fontSize: 12 }}>{item.paymentReference}</Text> : null}
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No tips yet. Tips access is controlled by the business owner.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  cartLink: { color: tokens.signalStrong, fontWeight: "800" },
  openCart: { backgroundColor: tokens.ink, borderRadius: 12, paddingVertical: 13, alignItems: "center" },
  openCartText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  preview: { height: 200, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  label: { color: tokens.ink, fontSize: 13, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  amountTitle: { fontWeight: "800", fontSize: 15, color: tokens.ink },
  amountGrid: { gap: 8 },
  amount: { borderWidth: 1, borderColor: tokens.line, borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  amountActive: { backgroundColor: tokens.ink, borderColor: tokens.ink },
  amountLabel: { fontWeight: "900", fontSize: 16, color: tokens.ink },
  amountLabelActive: { color: "#fff" },
  amountDetail: { fontSize: 12, color: tokens.steel, fontWeight: "600" },
});
