import { Tabs } from "expo-router";
import { useAuth } from "@/store/auth-context";
import { isWorkerLike } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { tokens } from "@/theme/tokens";

// Mirrors web `MobileBottomNav` + `navByRole`:
// - User primary: Shop, Cart, Tickets, Tip (+ header Favorites/Cart actions).
// - Worker primary: Checkout, Products, Orders, Ticket Entry.
// - `More` holds the overflow for both roles; Profile stays first-class.
export default function TabsLayout() {
  const { user } = useAuth();
  const worker = isWorkerLike(user);

  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        tabBarActiveTintColor: tokens.signalStrong,
        tabBarInactiveTintColor: tokens.steel,
        tabBarStyle: { backgroundColor: "#fff", borderTopColor: tokens.line },
      }}
    >
      <Tabs.Screen name="shop" options={{ title: "Shop", href: worker ? null : undefined }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", href: worker ? null : undefined }} />
      <Tabs.Screen name="tickets" options={{ title: "Tickets", href: worker ? null : undefined }} />
      <Tabs.Screen name="tips" options={{ title: "Tip", href: worker ? null : undefined }} />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Checkout",
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
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
      <Tabs.Screen
        name="verify"
        options={{
          title: "Entry",
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen name="more" options={{ title: "More" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      {/* Screens reachable via header / More / Profile — hidden from the tab bar */}
      <Tabs.Screen name="favorites" options={{ title: "Favorites", href: null }} />
      <Tabs.Screen name="carts" options={{ title: "My Carts", href: null }} />
      <Tabs.Screen name="sales" options={{ title: "Sales", href: null }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs", href: null }} />
      <Tabs.Screen name="applications" options={{ title: "My Applications", href: null }} />
    </Tabs>
  );
}
