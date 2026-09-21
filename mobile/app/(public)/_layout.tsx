import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { PublicHeader } from "@/components/public-header";
import { tokens } from "@/theme/tokens";

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

// Guest browsing: same Products / Tickets / Jobs views as the user
// dashboard, but every action button redirects to the sign-in screen.
export default function PublicTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <PublicHeader />,
        tabBarActiveTintColor: tokens.signalStrong,
        tabBarInactiveTintColor: tokens.steel,
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: tokens.line },
      }}
    >
      <Tabs.Screen name="products" options={{ title: "Products", tabBarIcon: tabIcon("storefront") }} />
      <Tabs.Screen name="tickets" options={{ title: "Tickets", tabBarIcon: tabIcon("ticket") }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs", tabBarIcon: tabIcon("briefcase") }} />
      <Tabs.Screen name="tips" options={{ title: "Tip worker", tabBarIcon: tabIcon("heart") }} />
    </Tabs>
  );
}
