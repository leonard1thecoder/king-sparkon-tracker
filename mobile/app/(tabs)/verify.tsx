import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { verifyTicketByQr, verifyTicketByReference } from "@/lib/api";
import type { FaceVerificationDecision, TicketVerificationResult } from "@/lib/types";
import { useAuth } from "@/store/auth-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function TicketEntryScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [reference, setReference] = useState("");
  const [scanning, setScanning] = useState(true);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<TicketVerificationResult | null>(null);

  useEffect(() => {
    if (!permission?.granted) void requestPermission();
  }, [permission, requestPermission]);

  const workerId = String(user?.id ?? "");

  async function run(value: string, byQr: boolean, faceDecision: FaceVerificationDecision) {
    if (!value.trim()) return;
    if (!workerId) {
      setResult({ valid: false, message: "Sign in as a worker before verifying tickets." });
      return;
    }
    setBusy(true);
    try {
      const outcome = byQr
        ? await verifyTicketByQr(value, workerId, faceDecision)
        : await verifyTicketByReference(value, workerId, faceDecision);
      setResult(outcome);
    } catch (e) {
      setResult({ valid: false, message: e instanceof Error ? e.message : "Verification unavailable. Do not admit the guest." });
    } finally {
      setBusy(false);
      setScanning(false);
    }
  }

  if (!permission?.granted) {
    return (
      <Screen>
        <Title>Ticket entry</Title>
        <Subtitle>Camera access is needed for gate verification.</Subtitle>
        <PrimaryButton title="Grant camera permission" onPress={() => void requestPermission()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Title>Ticket entry</Title>
      <Subtitle>
        Scan the ticket, compare the guest with the owner photo, then admit or deny — mirrors web `/dashboard/worker/tickets/scan`.
        Scanning alone never admits.
      </Subtitle>

      {scanning ? (
        <View style={styles.preview}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={(event) => {
              setScanning(false);
              void run(event.data, true, "PENDING");
            }}
          />
        </View>
      ) : null}

      <Card>
        <TextInput value={reference} onChangeText={setReference} placeholder="Or enter ticket reference…" style={styles.input} />
        <PrimaryButton title={busy ? "…" : "Verify reference"} onPress={() => void run(reference, false, "PENDING")} disabled={busy} />
      </Card>

      {result ? (
        <Card>
          <StatusPill label={result.valid ? "VALID — compare photo" : "DO NOT ADMIT"} tone={result.valid ? "success" : "action"} />
          <Text style={{ fontSize: 13 }}>{result.message}</Text>
          {result.valid ? (
            <View style={styles.row}>
              <DecisionButton label="Match — admit" tone="confirm" disabled={busy} onPress={() => void run(reference, false, "MATCH")} />
              <DecisionButton label="Mismatch — deny" tone="danger" disabled={busy} onPress={() => void run(reference, false, "MISMATCH")} />
            </View>
          ) : null}
          <PrimaryButton title="Scan next" onPress={() => { setResult(null); setReference(""); setScanning(true); }} />
        </Card>
      ) : null}
      <ErrorText message={null} />
    </Screen>
  );
}

function DecisionButton({ label, tone, disabled, onPress }: { label: string; tone: "confirm" | "danger"; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.decision, tone === "confirm" ? styles.confirm : styles.danger, disabled && { opacity: 0.5 }]}
    >
      <Text style={styles.decisionText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  preview: { height: 220, borderRadius: 12, overflow: "hidden", backgroundColor: "#000" },
  input: { backgroundColor: "#fff", borderWidth: 1, borderColor: tokens.line, borderRadius: 12, padding: 10, color: tokens.ink },
  row: { flexDirection: "row", gap: 8 },
  decision: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  confirm: { backgroundColor: tokens.confirm },
  danger: { backgroundColor: tokens.danger },
  decisionText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
