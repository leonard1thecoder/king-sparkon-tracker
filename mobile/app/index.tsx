import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "@/store/auth-context";
import { tokens } from "@/theme/tokens";

export default function Index() {
  const { user, loading, refresh } = useAuth();

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: tokens.paper, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator color={tokens.signal} />
      </View>
    );
  }

  if (!user) return <Redirect href="/(public)/products" />;
  return <Redirect href="/(tabs)/shop" />;
}
