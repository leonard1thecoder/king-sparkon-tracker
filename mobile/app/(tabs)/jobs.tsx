import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, TextInput } from "react-native";
import { Link } from "expo-router";
import { listJobs, type MobileJob } from "@/lib/api";
import { normalizeList } from "@/lib/types";
import { Card, ErrorText, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function JobsScreen() {
  const [jobs, setJobs] = useState<MobileJob[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listJobs({ size: 50, keyword: keyword.trim() || undefined });
      setJobs(normalizeList(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load jobs.");
    } finally {
      setLoading(false);
    }
  }, [keyword]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>Jobs</Title>
      <Subtitle>Browse open opportunities — mirrors web `/dashboard/user/jobs`.</Subtitle>
      <TextInput
        value={keyword}
        onChangeText={setKeyword}
        placeholder="Search keyword…"
        style={{ backgroundColor: "#fff", borderWidth: 1, borderColor: "#D8D3C4", borderRadius: 12, padding: 10 }}
        onSubmitEditing={() => void load()}
      />
      <ErrorText message={error} />
      <FlatList
        data={jobs}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>{item.title}</Text>
            <Text style={{ fontSize: 12 }}>
              {item.businessName ?? item.companyName ?? "King Sparkon business"}
              {item.location ? ` · ${item.location}` : ""}
            </Text>
            <StatusPill label={item.status ?? "OPEN"} tone={String(item.status ?? "OPEN").toUpperCase() === "OPEN" ? "success" : "neutral"} />
            <Link href={`/job/${item.id}`} style={{ color: "#C93316", fontWeight: "800" }}>
              View and apply →
            </Link>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No open jobs right now.</Text> : null}
      />
    </Screen>
  );
}
