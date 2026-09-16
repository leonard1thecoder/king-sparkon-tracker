import { Text, View } from "react-native";
import { useAuth } from "@/store/auth-context";
import { getUserRoles } from "@/lib/types";
import { Card, PrimaryButton, Screen, StatusPill, Subtitle, Title } from "@/components/ui";
import { backendBaseUrl } from "@/lib/api-client";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <Screen>
      <Title>Profile</Title>
      <Subtitle>Identity and session — mirrors web profile workspaces.</Subtitle>
      <Card>
        <Text style={{ fontWeight: "800", fontSize: 16 }}>{user?.username ?? "Signed out"}</Text>
        <Text>{user?.emailAddress}</Text>
        <View style={{ flexDirection: "row", gap: 6, flexWrap: "wrap" }}>
          {getUserRoles(user).map((role) => (
            <StatusPill key={role} label={role} />
          ))}
        </View>
        {user?.businessName ? <Text>Business: {user.businessName}</Text> : null}
        <Text style={{ fontSize: 12 }}>Backend: {backendBaseUrl()}</Text>
        <PrimaryButton title="Sign out" onPress={() => void signOut()} />
      </Card>
    </Screen>
  );
}
