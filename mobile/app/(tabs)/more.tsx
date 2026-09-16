import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Screen, Subtitle, Title } from "@/components/ui";
import { tokens } from "@/theme/tokens";

type Entry = { label: string; detail: string; href: string };

const workerEntries: Entry[] = [
  { label: "Product Sales", detail: "Paid counter checkouts and collected online carts.", href: "/(tabs)/sales" },
  { label: "Tips & QR", detail: "Owner-controlled tips workspace.", href: "/(tabs)/tips" },
  { label: "My Carts", detail: "Your own purchase history.", href: "/(tabs)/carts" },
  { label: "Favorites", detail: "Businesses you follow.", href: "/(tabs)/favorites" },
];

export default function MoreScreen() {
  return (
    <Screen>
      <Title>More</Title>
      <Subtitle>Secondary worker destinations.</Subtitle>
      <Card>
        {workerEntries.map((entry) => (
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
