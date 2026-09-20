import { Tabs } from "expo-router";
import { PublicHeader } from "@/components/public-header";
import { tokens } from "@/theme/tokens";

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
      <Tabs.Screen name="products" options={{ title: "Products" }} />
      <Tabs.Screen name="tickets" options={{ title: "Tickets" }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs" }} />
      <Tabs.Screen name="tips" options={{ title: "Tip worker" }} />
    </Tabs>
  );
}
