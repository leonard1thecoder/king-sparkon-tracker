import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/store/auth-context";
import { getUserRoles, isWorkerLike } from "@/lib/types";
import { Card, Screen, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

type Entry = { label: string; detail: string; href: string };

const userEntries: Entry[] = [
  { label: "Tip Cart", detail: "Pay unpaid worker tips added from QR scans.", href: "/tip-cart" },
  { label: "Jobs", detail: "Browse open opportunities and apply.", href: "/(tabs)/jobs" },
  { label: "My Applications", detail: "Track your job applications.", href: "/(tabs)/applications" },
  { label: "My Carts", detail: "Review product purchases and collections.", href: "/(tabs)/carts" },
  { label: "Favorites", detail: "Favorited businesses and quick access.", href: "/(tabs)/favorites" },
  { label: "Check UIF Status", detail: "Enter your 13-digit ID to check UIF status.", href: "/uif/status" },
  { label: "Update UIF Password", detail: "Reset your UIF online status password.", href: "/uif/password" },
  { label: "UIF Cart", detail: "UIF password reset cart and payment.", href: "/uif/cart" },
  { label: "Apply for UIF Benefits", detail: "UI-19, salary schedule and UIF 2.8 checklist.", href: "/uif/apply" },
];

const workerEntries: Entry[] = [
  { label: "Product Sales", detail: "Paid counter checkouts and collected online carts.", href: "/(tabs)/sales" },
  { label: "Tips & QR", detail: "Owner-controlled tips workspace.", href: "/(tabs)/tips" },
  { label: "My Carts", detail: "Your own purchase history.", href: "/(tabs)/carts" },
  { label: "Favorites", detail: "Businesses you follow.", href: "/(tabs)/favorites" },
];

export default function MoreScreen() {
  const { user } = useAuth();
  const worker = isWorkerLike(user);
  const roles = getUserRoles(user);
  const entries = [...(worker ? workerEntries : userEntries)];
  if (worker && roles.includes("User")) entries.push(...userEntries.filter((e) => e.href.startsWith("/uif")));

  return (
    <Screen>
      <Title>More</Title>
      <Subtitle>{worker ? "Secondary worker destinations." : "Shortcuts, carts, favorites and UIF services."}</Subtitle>
      <Card>
        {entries.map((entry) => (
          <Link key={entry.href + entry.label} href={entry.href} asChild>
            <Pressable style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{entry.label}</Text>
                <Text style={styles.detail}>{entry.detail}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
        ))}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: tokens.line },
  label: { color: tokens.ink, fontWeight: "800", fontSize: 15 },
  detail: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  chevron: { color: tokens.signalStrong, fontSize: 20, fontWeight: "900" },
});
