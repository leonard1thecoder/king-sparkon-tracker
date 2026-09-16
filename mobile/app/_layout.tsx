import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider } from "@/store/auth-context";
import { CartProvider } from "@/store/cart-context";
import { FavoritesProvider } from "@/store/favorites-context";
import { TipTrayProvider } from "@/store/tip-tray-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <TipTrayProvider>
              <StatusBar style="dark" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="product/[id]" options={{ headerShown: true, title: "Product" }} />
                <Stack.Screen name="tip-cart" options={{ headerShown: true, title: "Tip Cart" }} />
                <Stack.Screen name="uif/status" options={{ headerShown: true, title: "Check UIF Status" }} />
                <Stack.Screen name="uif/password" options={{ headerShown: true, title: "Update UIF Password" }} />
                <Stack.Screen name="uif/cart" options={{ headerShown: true, title: "UIF Cart" }} />
                <Stack.Screen name="uif/apply" options={{ headerShown: true, title: "Apply for UIF Benefits" }} />
              </Stack>
            </TipTrayProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
