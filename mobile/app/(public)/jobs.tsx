import { useCallback, useEffect, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, TextInput } from "react-native";
import { router } from "expo-router";
import { listJobs, type MobileJob } from "@/lib/api";
import { DEMO_NOTICE, demoJobs } from "@/lib/demo-data";
import { normalizeList } from "@/lib/types";
import { Card, ErrorText, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

// Guest mirror of the user Jobs tab — same opportunity view, but
// viewing details and applying require sign-in.
export default function PublicJobsScreen() {
  const [jobs, setJobs] = useState<MobileJob[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listJobs({ size: 50, keyword: keyword.trim() || undefined });
      setJobs(normalizeList(result));
      setDemo(false);
    } catch {
      setJobs(demoJobs(keyword));
      setDemo(true);
      setError(null);
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
      {demo ? <Text style={{ color: tokens.steel, fontSize: 12, fontWeight: "700" }}>{DEMO_NOTICE}</Text> : null}
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
            <Pressable
              onPress={() => router.replace("/(auth)/login")}
              accessibilityRole="button"
              accessibilityLabel="Sign in to view and apply"
            >
              <Text style={{ color: "#C93316", fontWeight: "800" }}>View and apply →</Text>
            </Pressable>
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No open jobs right now.</Text> : null}
      />
    </Screen>
  );
}
