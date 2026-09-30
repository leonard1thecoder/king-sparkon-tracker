import { Text } from "react-native";
import { useAuth } from "@/store/auth-context";
import { isSouthAfrica } from "@/lib/localization";
import { Card, Screen, Title } from "@/components/ui";
import type { ReactNode } from "react";

export function RegionGate({ serviceName, children }: { serviceName: string; children: ReactNode }) {
  const { user } = useAuth();
  if (isSouthAfrica(user?.localizationCountry)) {
    return <>{children}</>;
  }
  return (
    <Screen>
      <Title>South Africa only</Title>
      <Card>
        <Text style={{ fontWeight: "800", fontSize: 15 }}>{serviceName} is available in South Africa only.</Text>
        <Text style={{ fontSize: 12 }}>
          Your account is registered outside South Africa, so this service is hidden and cannot be purchased.
        </Text>
      </Card>
    </Screen>
  );
}
