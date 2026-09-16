import { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text } from "react-native";
import { listMyJobApplications, type MobileJobApplication } from "@/lib/api";
import { normalizeList } from "@/lib/types";
import { Card, ErrorText, Screen, StatusPill, Subtitle, Title } from "@/components/ui";

export default function ApplicationsScreen() {
  const [applications, setApplications] = useState<MobileJobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listMyJobApplications();
      setApplications(normalizeList(result));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load applications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Screen>
      <Title>My applications</Title>
      <Subtitle>Track your job applications — mirrors web `/dashboard/user/applications`.</Subtitle>
      <ErrorText message={error} />
      <FlatList
        data={applications}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={() => void load()} />}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ fontWeight: "800", fontSize: 15 }}>
              {item.jobPost?.title ?? `Application #${item.id}`}
            </Text>
            <Text style={{ fontSize: 12 }}>
              {item.jobPost?.businessName ?? item.jobPost?.companyName ?? ""}
              {item.createdDate ? ` · ${item.createdDate.slice(0, 10)}` : ""}
            </Text>
            <StatusPill label={item.status ?? "SUBMITTED"} tone="action" />
          </Card>
        )}
        ListEmptyComponent={!loading ? <Text>No applications yet. Browse Jobs to apply.</Text> : null}
      />
    </Screen>
  );
}
