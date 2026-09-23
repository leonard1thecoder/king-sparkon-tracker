import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/store/auth-context";
import { isWorkerLike } from "@/lib/types";
import { AppHeader } from "@/components/app-header";
import { tokens } from "@/theme/tokens";

function tabIcon(name: keyof typeof Ionicons.glyphMap) {
  return ({ color, size }: { color: string; size: number }) => (
    <Ionicons name={name} size={size} color={color} />
  );
}

// Mirrors web `MobileBottomNav` + `navByRole`:
// - User primary: Shop, Cart, Tickets, Tip; Favorites, Cart, Profile and Logout stay in the header.
// - Worker primary: Checkout, Products, Orders, Ticket Entry.
// - `More` holds worker overflow only; User shortcuts live on Profile.
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
      <Tabs.Screen name="shop" options={{ title: "Shop", tabBarIcon: tabIcon("storefront"), href: worker ? null : undefined }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon: tabIcon("cart"), href: worker ? null : undefined }} />
      <Tabs.Screen name="tickets" options={{ title: "Tickets", tabBarIcon: tabIcon("ticket"), href: worker ? null : undefined }} />
      <Tabs.Screen name="tips" options={{ title: "Tip", tabBarIcon: tabIcon("heart"), href: worker ? null : undefined }} />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Checkout",
          tabBarIcon: tabIcon("scan"),
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: "Products",
          tabBarIcon: tabIcon("cube"),
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: "Orders",
          tabBarIcon: tabIcon("receipt"),
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="verify"
        options={{
          title: "Entry",
          tabBarIcon: tabIcon("shield-checkmark"),
          href: worker ? undefined : null,
        }}
      />
      <Tabs.Screen name="more" options={{ title: "More", tabBarIcon: tabIcon("ellipsis-horizontal"), href: worker ? undefined : null }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon("person") }} />
      {/* Screens reachable via header / More / Profile — hidden from the tab bar */}
      <Tabs.Screen name="favorites" options={{ title: "Favorites", href: null }} />
      <Tabs.Screen name="carts" options={{ title: "My Carts", href: null }} />
      <Tabs.Screen name="sales" options={{ title: "Sales", href: null }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs", href: null }} />
      <Tabs.Screen name="applications" options={{ title: "My Applications", href: null }} />
      <Tabs.Screen name="care" options={{ title: "Computer Care", href: null }} />
      <Tabs.Screen name="devhub" options={{ title: "Dev Hub", href: null }} />
    </Tabs>
  );
}
