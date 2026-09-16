import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/store/auth-context";
import { getUserRoles, isWorkerLike } from "@/lib/types";
import { Card, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { backendBaseUrl } from "@/lib/api-client";
import { tokens } from "@/theme/tokens";

const userShortcuts = [
  { label: "My Carts", detail: "Review product purchases and collections.", href: "/(tabs)/carts" },
  { label: "My Tickets", detail: "View purchased tickets.", href: "/(tabs)/tickets" },
  { label: "Favorites", detail: "Businesses you follow.", href: "/(tabs)/favorites" },
];

const uifShortcuts = [
  { label: "Check UIF Status", href: "/uif/status" },
  { label: "Update UIF Password", href: "/uif/password" },
  { label: "UIF Cart", href: "/uif/cart" },
  { label: "Apply for Benefits", href: "/uif/apply" },
];

const workerShortcuts = [
  { label: "Products & Barcodes", detail: "Manage workplace product stock codes.", href: "/(tabs)/products" },
  { label: "Counter Checkout", detail: "Complete cash or card product sales.", href: "/(tabs)/scan" },
  { label: "Online Orders", detail: "Prepare paid carts for collection.", href: "/(tabs)/orders" },
  { label: "Product Sales", detail: "Review completed product carts.", href: "/(tabs)/sales" },
  { label: "Ticket Entry", detail: "Gate QR and photo verification.", href: "/(tabs)/verify" },
];

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [uifOpen, setUifOpen] = useState(false);
  const roles = getUserRoles(user);
  const worker = isWorkerLike(user);
  const shortcuts = worker ? workerShortcuts : userShortcuts;

  return (
    <Screen>
      <Title>Profile</Title>
      <Subtitle>Identity, shortcuts and session — mirrors web profile workspaces.</Subtitle>
      <Card>
        <Text style={{ fontWeight: "800", fontSize: 16 }}>{user?.username ?? "Signed out"}</Text>
        <Text>{user?.emailAddress}</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {roles.map((role) => (
            <StatusPill key={role} label={role} />
          ))}
        </View>
        {user?.businessName ? <Text>Business: {user.businessName}</Text> : null}
        <Text style={{ fontSize: 12 }}>Backend: {backendBaseUrl()}</Text>
      </Card>

      <Card>
        <Text style={styles.section}>{worker ? "Worker shortcuts" : "Account shortcuts"}</Text>
        {shortcuts.map((item) => (
          <Link key={item.href + item.label} href={item.href} asChild>
            <Pressable style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>{item.label}</Text>
                <Text style={styles.detail}>{item.detail}</Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          </Link>
        ))}

        {!worker ? (
          <>
            <Pressable style={styles.row} onPress={() => setUifOpen((v) => !v)} accessibilityExpanded={uifOpen}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>UIF</Text>
                <Text style={styles.detail}>Status, password, cart and applications.</Text>
              </View>
              <Text style={styles.chevron}>{uifOpen ? "▾" : "▸"}</Text>
            </Pressable>
            {uifOpen ? (
              <View style={styles.submenu}>
                {uifShortcuts.map((item) => (
                  <Link key={item.href} href={item.href} asChild>
                    <Pressable style={styles.row}>
                      <Text style={styles.label}>{item.label}</Text>
                      <Text style={styles.chevron}>›</Text>
                    </Pressable>
                  </Link>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </Card>

      <PrimaryButton title="Sign out" onPress={() => void signOut()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  section: { color: tokens.steel, fontSize: 11, fontWeight: "900", letterSpacing: 1.2, textTransform: "uppercase" },
  row: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: tokens.line },
  label: { color: tokens.ink, fontWeight: "800", fontSize: 15, flex: 1 },
  detail: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
  chevron: { color: tokens.signalStrong, fontSize: 20, fontWeight: "900" },
  submenu: { paddingLeft: 12 },
});
