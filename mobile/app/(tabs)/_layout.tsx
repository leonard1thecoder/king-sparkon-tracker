import { Tabs } from "expo-router";
import { useAuth } from "@/store/auth-context";
import { isWorkerLike } from "@/lib/types";
import { tokens } from "@/theme/tokens";

export default function TabsLayout() {
  const { user } = useAuth();
  const worker = isWorkerLike(user);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: tokens.signalStrong,
        tabBarInactiveTintColor: tokens.steel,
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: tokens.line },
      }}
    >
      <Tabs.Screen name="shop" options={{ title: "Shop" }} />
      <Tabs.Screen name="cart" options={{ title: "Cart" }} />
      <Tabs.Screen name="tickets" options={{ title: "Tickets" }} />
      <Tabs.Screen name="tips" options={{ title: "Tip" }} />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Checkout",
          // Hide worker checkout from pure buyers; workers/owners keep it.
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
