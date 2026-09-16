import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { applyForJob, getJobById, type MobileJob } from "@/lib/api";
import { useAuth } from "@/store/auth-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

export default function JobDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<MobileJob | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cover, setCover] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    let active = true;
    getJobById(id)
      .then((result) => {
        if (active) {
          setJob(result);
          setName(user?.username ?? "");
          setEmail(user?.emailAddress ?? "");
        }
      })
      .catch((e: unknown) => {
        if (active) setError(e instanceof Error ? e.message : "Could not load job.");
      });
    return () => {
      active = false;
    };
  }, [id, user]);

  async function apply() {
    if (!name.trim() || !email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await applyForJob(id, {
        applicantName: name.trim(),
        applicantEmail: email.trim(),
        phoneNumber: phone.trim() || undefined,
        coverMessage: cover.trim() || undefined,
        cvUrl: cvUrl.trim() || undefined,
      });
      setApplied(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Application failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>{job?.title ?? `Job ${id}`}</Title>
      <Subtitle>
        {job ? `${job.businessName ?? job.companyName ?? "King Sparkon business"}${job.location ? ` · ${job.location}` : ""}` : "Loading job details."}
      </Subtitle>
      <ErrorText message={error} />
      {job ? (
        <Card>
          <StatusPill label={job.status ?? "OPEN"} tone="success" />
          <Text>{job.jobDescription ?? job.description ?? ""}</Text>
          {job.requirements ? <Text style={{ fontSize: 12 }}>Requirements: {job.requirements}</Text> : null}
        </Card>
      ) : null}
      <Card>
        <Text style={styles.label}>Apply for this job</Text>
        {applied ? <StatusPill label="Application submitted" tone="success" /> : null}
        <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="Phone (optional)" keyboardType="phone-pad" style={styles.input} />
        <TextInput value={cover} onChangeText={setCover} placeholder="Cover message (optional)" multiline style={styles.input} />
        <TextInput value={cvUrl} onChangeText={setCvUrl} placeholder="CV link (optional)" autoCapitalize="none" style={styles.input} />
        <PrimaryButton title={busy ? "Submitting…" : "Submit application"} onPress={() => void apply()} disabled={busy || applied} />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: tokens.ink, fontSize: 14, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
});
