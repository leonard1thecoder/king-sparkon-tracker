import { useState } from "react";
import { Text } from "react-native";
import { fetchUifBenefits } from "@/lib/api";
import { uifRowSummary, type UifBenefitRow } from "@/lib/types";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { UifHint, UifIdInput, isValidUifId } from "@/components/uif";

export default function UifStatusScreen() {
  const [idNumber, setIdNumber] = useState("");
  const [rows, setRows] = useState<UifBenefitRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function check() {
    if (!isValidUifId(idNumber)) {
      setError("Enter a valid 13-digit ID number.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      setRows(await fetchUifBenefits(idNumber));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Status check failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Check UIF Status</Title>
      <Subtitle>Mirrors web `/dashboard/user/uif/status`. Input blocks non-digits and enforces 13-digit length.</Subtitle>
      <Card>
        <UifIdInput value={idNumber} onChange={setIdNumber} />
        <UifHint>Your ID is sent securely to the backend and never stored on this device.</UifHint>
        <ErrorText message={error} />
        <PrimaryButton title={busy ? "Checking…" : "Check UIF Status"} onPress={() => void check()} disabled={busy} />
      </Card>
      {rows ? (
        <Card>
          <Text style={{ fontWeight: "800" }}>{rows.length === 0 ? "No benefit records found." : `${rows.length} record${rows.length === 1 ? "" : "s"}`}</Text>
          {rows.map((row, index) => {
            const summary = uifRowSummary(row);
            return (
              <Card key={`${summary.applicationNumber || "row"}-${index}`}>
                {summary.benefitType ? <Text style={{ fontWeight: "800" }}>{summary.benefitType}</Text> : null}
                {summary.applicationNumber ? <Text>Application: {summary.applicationNumber}</Text> : null}
                {summary.applicationDate ? <Text>Date: {summary.applicationDate}</Text> : null}
                {summary.claimStatus ? <StatusPill label={summary.claimStatus} tone="action" /> : null}
              </Card>
            );
          })}
        </Card>
      ) : null}
    </Screen>
  );
}
