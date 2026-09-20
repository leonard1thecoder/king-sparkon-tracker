import { useCallback, useEffect, useRef, useState } from "react";
import { FlatList, Image, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Link, useLocalSearchParams } from "expo-router";
import { listBusinessWorkers, listUserBusinesses, listWorkerTips, type UserBusiness, type WorkerTipCard } from "@/lib/api";
import { useFavorites } from "@/store/favorites-context";
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
  const { workerFavorites, toggleWorkerFavorite, isWorkerFavorite } = useFavorites();
  const params = useLocalSearchParams<{ workerId?: string | string[] }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [result, setResult] = useState<WorkerQrResult | null>(null);
  const [manual, setManual] = useState("");
  const [scanning, setScanning] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addedAmount, setAddedAmount] = useState<number | null>(null);
  const [businesses, setBusinesses] = useState<UserBusiness[]>([]);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [workers, setWorkers] = useState<WorkerTipCard[]>([]);
  const [query, setQuery] = useState("");
  const [workersLoading, setWorkersLoading] = useState(false);
  const [workersError, setWorkersError] = useState<string | null>(null);
  const presetApplied = useRef(false);

  useEffect(() => {
    if (!permission?.granted) void requestPermission();
  }, [permission, requestPermission]);

  useEffect(() => {
    let active = true;
    listUserBusinesses()
      .then((rows) => {
        if (!active) return;
        const list = Array.isArray(rows) ? rows : [];
        setBusinesses(list);
        setBusinessId((current) =>
          current !== null && list.some((business) => business.businessId === current)
            ? current
            : list.length > 0
              ? list[0].businessId
              : null,
        );
      })
      .catch(() => {
        if (active) setBusinesses([]);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (businessId === null) {
      setWorkers([]);
      return;
    }
    let active = true;
    setWorkersLoading(true);
    setWorkersError(null);
    listBusinessWorkers(businessId)
      .then((rows) => {
        if (active) setWorkers(Array.isArray(rows) ? rows : []);
      })
      .catch((e: unknown) => {
        if (active) {
          setWorkers([]);
          setWorkersError(e instanceof Error ? e.message : "Could not load workers.");
        }
      })
      .finally(() => {
        if (active) setWorkersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [businessId]);

  // Deep link from Favorites ("Tip worker") presets the amount step.
  useEffect(() => {
    if (presetApplied.current) return;
    const raw = Array.isArray(params.workerId) ? params.workerId[0] : params.workerId;
    if (!raw) return;
    const digits = raw.match(/\d+/);
    if (!digits) return;
    presetApplied.current = true;
    setResult({ workerId: digits[0], source: "RAW", rawValue: raw });
    setAddedAmount(null);
    setError(null);
    setScanning(false);
  }, [params.workerId]);

  function selectWorkerForTip(worker: WorkerTipCard) {
    setResult({ workerId: String(worker.workerId), source: "RAW", rawValue: String(worker.workerId) });
    setAddedAmount(null);
    setError(null);
    setScanning(false);
  }

  const activeBusiness = businesses.find((business) => business.businessId === businessId) ?? null;
  const needle = query.trim().toLowerCase();
  const visibleWorkers = needle
    ? workers.filter(
        (worker) =>
          worker.username.toLowerCase().includes(needle) || (worker.jobTitle ?? "").toLowerCase().includes(needle),
      )
    : workers;

  function handleScan(value: string) {
    const parsed = parseWorkerTipQr(value);
    if (!parsed) {
      setError("This QR code does not look like a worker tip QR. Scan a worker QR or enter a worker ID manually.");
      return;
    }
    setResult(parsed);
    setAddedAmount(null);
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
      // Tips pay through the shared cart payout: store an intent here;
      // POST /payments/payfast charges it with products/tickets.
      await addToTray({ workerId: backendWorkerId, workerLabel: `Worker ${result.workerId}`, tipAmount: amount });
      setAddedAmount(amount);
      setSelected(null);
      setCustomAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Tip failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Tip worker</Title>
      <Subtitle>Scan, set an amount, submit to the tip cart, pay there — mirrors web `/dashboard/user/tips`.</Subtitle>

      <Link href="/tip-cart" style={styles.cartLink}>
        Tip cart{trayCount > 0 ? ` (${trayCount})` : ""} →
      </Link>

      {workerFavorites.length > 0 ? (
        <Card>
          <Text style={styles.label}>♥ Favorite workers ({workerFavorites.length})</Text>
          {workerFavorites.map((favorite) => (
            <View key={`${favorite.businessId ?? "any"}:${favorite.workerId}`} style={styles.workerRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{favorite.username.trim().charAt(0).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{favorite.username}</Text>
                <Text style={styles.workerMeta}>
                  {favorite.jobTitle || "Worker"}{favorite.businessName ? ` · ${favorite.businessName}` : ""}
                </Text>
              </View>
              <PrimaryButton
                title="Tip"
                onPress={() => {
                  setResult({ workerId: String(favorite.workerId), source: "RAW", rawValue: String(favorite.workerId) });
                  setAddedAmount(null);
                  setError(null);
                  setScanning(false);
                }}
              />
            </View>
          ))}
        </Card>
      ) : null}

      <Card>
        <Text style={styles.label}>Find workers</Text>
        <Text style={styles.hint}>Pick a business, search by name, or scan a worker QR below.</Text>
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
        {workersError ? <Text style={styles.workersError}>{workersError}</Text> : null}
        {workersLoading ? <Text style={styles.hint}>Loading workers…</Text> : null}
        {!workersLoading && visibleWorkers.length === 0 ? (
          <Text style={styles.hint}>
            {workers.length === 0 ? "No workers found for this business." : "No workers match your search."}
          </Text>
        ) : null}
        {visibleWorkers.map((worker) => {
          const favorited = isWorkerFavorite(worker.workerId, activeBusiness?.businessId ?? null);
          return (
            <View key={worker.workerId} style={styles.workerRow}>
              {worker.profilePictureUrl ? (
                <Image source={{ uri: worker.profilePictureUrl }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{worker.username.trim().charAt(0).toUpperCase()}</Text>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={styles.workerName}>{worker.username}</Text>
                <Text style={styles.workerMeta}>
                  {worker.jobTitle || "Worker"}{activeBusiness ? ` · ${activeBusiness.businessName}` : ""}
                </Text>
              </View>
              <Pressable
                onPress={() =>
                  void toggleWorkerFavorite({
                    workerId: worker.workerId,
                    username: worker.username,
                    jobTitle: worker.jobTitle,
                    businessId: activeBusiness?.businessId ?? null,
                    businessName: activeBusiness?.businessName ?? null,
                    profilePictureUrl: worker.profilePictureUrl,
                  })
                }
                style={[styles.favButton, favorited && styles.favButtonActive]}
                accessibilityRole="button"
                accessibilityLabel={favorited ? `Remove ${worker.username} from favorites` : `Add ${worker.username} to favorites`}
              >
                <Text style={[styles.favText, favorited && styles.favTextActive]}>♥</Text>
              </Pressable>
              <PrimaryButton title="Tip worker" onPress={() => selectWorkerForTip(worker)} />
            </View>
          );
        })}
      </Card>

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
            {result ? <PrimaryButton title="Scan again" onPress={() => { setResult(null); setAddedAmount(null); setScanning(true); }} /> : null}
          </View>
      </Card>

      <ErrorText message={error} />

      {result ? (
        <Card>
          <StatusPill label={`Worker ${result.workerId} · ${result.source}`} tone="success" />
          <Text style={styles.amountTitle}>Set amount</Text>
          <View style={styles.amountGrid}>
            {amounts.map((entry) => (
              <Pressable key={entry.id} onPress={() => { setSelected(entry.id); setAddedAmount(null); }} style={[styles.amount, selected === entry.id && styles.amountActive]}>
                <Text style={[styles.amountLabel, selected === entry.id && styles.amountLabelActive]}>{entry.label}</Text>
                <Text style={styles.amountDetail}>{entry.detail}</Text>
              </Pressable>
            ))}
            <Pressable onPress={() => { setSelected("custom"); setAddedAmount(null); }} style={[styles.amount, selected === "custom" && styles.amountActive]}>
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

      {addedAmount !== null ? (
        <Card>
          <StatusPill label="Added to tip cart" tone="success" />
          <Text>R{addedAmount.toFixed(2)} for worker {result?.workerId} — pay it with the shared cart payout.</Text>
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
  hint: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  workersError: { color: tokens.danger, fontSize: 13, fontWeight: "700" },
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
  row: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chipRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  chip: { borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: "#fff" },
  chipActive: { backgroundColor: tokens.ink, borderColor: tokens.ink },
  chipText: { fontWeight: "800", fontSize: 13, color: tokens.ink },
  chipTextActive: { color: "#fff" },
  workerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: tokens.ink, alignItems: "center", justifyContent: "center" },
  avatarImage: { width: 44, height: 44, borderRadius: 22 },
  avatarText: { color: "#fff", fontWeight: "900", fontSize: 18 },
  workerName: { color: tokens.ink, fontWeight: "800", fontSize: 15 },
  workerMeta: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  favButton: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: tokens.line, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  favButtonActive: { backgroundColor: tokens.signal, borderColor: tokens.signal },
  favText: { color: tokens.steel, fontWeight: "900", fontSize: 16 },
  favTextActive: { color: "#fff" },
  amountTitle: { fontWeight: "800", fontSize: 15, color: tokens.ink },
  amountGrid: { gap: 8 },
  amount: { borderWidth: 1, borderColor: tokens.line, borderRadius: 12, padding: 12, backgroundColor: "#fff" },
  amountActive: { backgroundColor: tokens.ink, borderColor: tokens.ink },
  amountLabel: { fontWeight: "900", fontSize: 16, color: tokens.ink },
  amountLabelActive: { color: "#fff" },
  amountDetail: { fontSize: 12, color: tokens.steel, fontWeight: "600" },
});
