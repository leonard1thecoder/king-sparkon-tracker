import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { acceptDevHubRequest, listDevHubRequests, submitDevHubRequest, type DevHubRequest } from "@/lib/api";
import { useCart } from "@/store/cart-context";
import { Card, ErrorText, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

// Dev Hub AI console — mirrors web `/dev-hub`: submit a build request,
// receive an AI price range, accept it into the shared cart, pay at checkout.
export default function DevHubScreen() {
  const { addService } = useCart();
  const [requests, setRequests] = useState<DevHubRequest[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [projectType, setProjectType] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await listDevHubRequests();
      setRequests(Array.isArray(rows) ? rows : (rows.content ?? []));
    } catch (e) {
      setRequests([]);
      setError(e instanceof Error ? e.message : "Could not load dev requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function submit() {
    if (!name.trim() || !email.trim() || !projectType.trim() || !title.trim() || description.trim().length < 10) {
      setError("Name, email, project type, title and a longer description are required.");
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const created = await submitDevHubRequest({
        clientName: name.trim(),
        emailAddress: email.trim(),
        projectType: projectType.trim(),
        title: title.trim(),
        description: description.trim(),
      });
      setRequests((current) => [created, ...current]);
      setTitle("");
      setDescription("");
      setProjectType("");
      setNotice(`Request sent. AI estimate: R${Number(created.estimatedMinPrice).toFixed(2)} - R${Number(created.estimatedMaxPrice).toFixed(2)}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not submit request.");
    } finally {
      setBusy(false);
    }
  }

  async function accept(item: DevHubRequest) {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      const updated = await acceptDevHubRequest(item.id);
      setRequests((current) => current.map((row) => (row.id === item.id ? updated : row)));
      addService({
        serviceKind: "DEV_HUB",
        referenceId: String(item.id),
        label: `Dev Hub build — ${item.title}`,
        price: Number(updated.estimatedMaxPrice),
      });
      setNotice(`Accepted. R${Number(updated.estimatedMaxPrice).toFixed(2)} added to the shared cart — pay it from Cart.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not accept request.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Title>Dev Hub</Title>
      <Subtitle>Request a build, get an AI price range, accept it into the shared cart.</Subtitle>
      {notice ? <StatusPill label={notice} tone="success" /> : null}
      <ErrorText message={error} />
      <Card>
        <Text style={styles.label}>New build request</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Your name" style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email" keyboardType="email-address" autoCapitalize="none" style={styles.input} />
        <TextInput value={projectType} onChangeText={setProjectType} placeholder="Project type" style={styles.input} />
        <TextInput value={title} onChangeText={setTitle} placeholder="Project title" style={styles.input} />
        <TextInput value={description} onChangeText={setDescription} placeholder="Describe the build (min 10 chars)" multiline style={styles.input} />
        <PrimaryButton title={busy ? "Sending…" : "Get AI price"} onPress={() => void submit()} disabled={busy} />
      </Card>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={styles.name}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.projectType} · R{Number(item.estimatedMinPrice).toFixed(2)} - R{Number(item.estimatedMaxPrice).toFixed(2)}
            </Text>
            <View style={styles.row}>
              <StatusPill label={item.status} tone={item.status === "ACCEPTED" ? "success" : "neutral"} />
              {item.status !== "ACCEPTED" && item.status !== "REJECTED" ? (
                <PrimaryButton title="Accept to cart" onPress={() => void accept(item)} disabled={busy} />
              ) : null}
            </View>
            <Link href="/(tabs)/cart" style={styles.cartLink}>
              Open cart →
            </Link>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text style={styles.meta}>No requests yet. Send one above.</Text> : null}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: tokens.ink, fontSize: 13, fontWeight: "800" },
  input: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 12, padding: 10, color: tokens.ink },
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  name: { color: tokens.ink, fontWeight: "800", fontSize: 15 },
  meta: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  cartLink: { color: tokens.signalStrong, fontWeight: "800" },
});
