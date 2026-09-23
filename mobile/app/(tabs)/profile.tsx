import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/store/auth-context";
import { getUserRoles, isWorkerLike } from "@/lib/types";
import { Card, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { backendBaseUrl } from "@/lib/api-client";
import { tokens } from "@/theme/tokens";

const userHeaderShortcuts = [
  { label: "Buy Products", detail: "Browse the Tuck Shop.", href: "/(tabs)/shop" },
  { label: "My Tickets", detail: "View purchased tickets.", href: "/(tabs)/tickets" },
  { label: "Tip Cart", detail: "Pay unpaid worker tips added from QR scans.", href: "/tip-cart" },
  { label: "Applications", detail: "Track your job applications.", href: "/(tabs)/applications" },
  { label: "My Carts", detail: "Review product purchases and collections.", href: "/(tabs)/carts" },
];

const userSecondaryShortcuts = [
  { label: "Jobs", detail: "Browse open opportunities and apply.", href: "/(tabs)/jobs" },
  { label: "Computer Care", detail: "Service plan quotes you can pay from the cart.", href: "/(tabs)/care" },
  { label: "Dev Hub", detail: "Request a build and accept AI quotes.", href: "/(tabs)/devhub" },
  { label: "Favorites", detail: "Businesses you follow.", href: "/(tabs)/favorites" },
  { label: "Check UIF Status", detail: "Enter your 13-digit ID to check UIF status.", href: "/uif/status" },
  { label: "Update UIF Password", detail: "Reset your UIF online status password.", href: "/uif/password" },
  { label: "UIF Cart", detail: "UIF password reset cart and payment.", href: "/uif/cart" },
  { label: "Apply for UIF Benefits", detail: "UI-19, salary schedule and UIF 2.8 checklist.", href: "/uif/apply" },
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
  const roles = getUserRoles(user);
  const worker = isWorkerLike(user);

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
        {(worker ? workerShortcuts : userHeaderShortcuts).map((item) => (
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

      </Card>

      {!worker ? (
        <Card>
          <Text style={styles.section}>More shortcuts</Text>
          {userSecondaryShortcuts.map((item) => (
            <Link key={item.href} href={item.href} asChild>
              <Pressable style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.detail}>{item.detail}</Text>
                </View>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            </Link>
          ))}
        </Card>
      ) : null}

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
});
