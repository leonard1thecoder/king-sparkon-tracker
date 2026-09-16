import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { lookupProductByBarcode, workerBarcodeCheckout } from "@/lib/api";
import type { Product } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function WorkerScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [manual, setManual] = useState("");
  const [product, setProduct] = useState<Product | null>(null);
  const [scanning, setScanning] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  useEffect(() => {
    if (!permission?.granted) void requestPermission();
  }, [permission, requestPermission]);

  async function lookup(barcode: string) {
    if (!barcode.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const found = await lookupProductByBarcode(barcode);
      setProduct(found);
      setScanning(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Barcode not found.");
    } finally {
      setBusy(false);
    }
  }

  async function checkoutCash() {
    if (!product) return;
    setBusy(true);
    setError(null);
    try {
      await workerBarcodeCheckout({ paymentType: "CASH", items: [{ productId: product.id, quantity: 1 }] });
      setDone(`Sold ${product.name} for cash.`);
      setProduct(null);
      setScanning(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed.");
    } finally {
      setBusy(false);
    }
  }

  if (!permission?.granted) {
    return (
      <Screen>
        <Title>Counter checkout</Title>
        <Subtitle>Camera access is needed for worker scan flow.</Subtitle>
        <PrimaryButton title="Grant camera permission" onPress={() => void requestPermission()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>Counter checkout</Title>
      <Subtitle>Worker scan terminal — mirrors web `/dashboard/worker/scan`.</Subtitle>
      {scanning ? (
        <View style={styles.preview}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr", "ean13", "ean8", "code128", "upc_a", "upc_e"] }}
            onBarcodeScanned={(event) => {
              setScanning(false);
              void lookup(event.data);
            }}
          />
        </View>
      ) : null}
      <Card>
        <TextInput value={manual} onChangeText={setManual} placeholder="Or type barcode…" style={styles.input} onSubmitEditing={() => void lookup(manual)} />
        <PrimaryButton title={busy ? "…" : "Lookup"} onPress={() => void lookup(manual)} disabled={busy} />
      </Card>
      <ErrorText message={error} />
      {product ? (
        <Card>
          <StatusPill label={product.category} tone="action" />
          <Text style={styles.name}>{product.name}</Text>
          <Text>R{product.price.toFixed(2)} · {product.stockQuantity} in stock</Text>
          <PrimaryButton title="Sell for cash" onPress={() => void checkoutCash()} disabled={busy} />
          <PrimaryButton title="Scan next" onPress={() => { setProduct(null); setScanning(true); }} />
        </Card>
      ) : null}
      {done ? <StatusPill label={done} tone="success" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { height: 220, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#D8D3C4", borderRadius: 12, padding: 10 },
  name: { fontWeight: "800", fontSize: 16 },
});
