import { Pressable, StyleSheet, Text, View } from "react-native";
import { tokens } from "@/theme/tokens";
import { OAUTH_PROVIDERS, type OAuthProviderId, type OAuthProviderStatus } from "@/lib/oauth";

// Provider buttons — mirrors web `OAuthButtons` (OR divider, one button per
// enabled provider, locked while redirecting). Enabled flags come from
// GET /api/auth/oauth/providers so unconfigured providers stay hidden.
export function OAuthButtons({
  providers,
  pending,
  onSelect,
}: {
  providers: OAuthProviderStatus[] | null;
  pending: OAuthProviderId | null;
  onSelect: (provider: OAuthProviderId) => void;
}) {
  const enabled = OAUTH_PROVIDERS.filter(
    (provider) => providers === null || providers.some((status) => status.id === provider.id && status.enabled),
  );

  if (providers !== null && enabled.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.divider} accessible={false}>
        <View style={styles.line} />
        <Text style={styles.or}>OR</Text>
        <View style={styles.line} />
      </View>
      {enabled.map((provider) => (
        <Pressable
          key={provider.id}
          onPress={() => onSelect(provider.id)}
          disabled={pending !== null}
          accessibilityRole="button"
          style={[styles.button, pending !== null && styles.busy]}
        >
          <Text style={styles.label}>
            {pending === provider.id ? "Redirecting..." : `Continue with ${provider.displayName}`}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  divider: { flexDirection: "row", alignItems: "center", gap: 10 },
  line: { flex: 1, height: 1, backgroundColor: tokens.line },
  or: { color: tokens.steel, fontSize: 11, fontWeight: "900", letterSpacing: 1.5 },
  button: {
    backgroundColor: "#fff",
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
  },
  busy: { opacity: 0.6 },
  label: { color: tokens.ink, fontWeight: "900", fontSize: 15 },
});
