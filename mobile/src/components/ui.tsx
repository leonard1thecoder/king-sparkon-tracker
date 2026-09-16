import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View, type PressableProps } from "react-native";
import { tokens } from "@/theme/tokens";

export function Screen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function PrimaryButton({ title, ...props }: PressableProps & { title: string }) {
  return (
    <Pressable
      {...props}
      style={({ pressed }) => [styles.primary, pressed && styles.pressed, props.disabled && styles.disabled]}
    >
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function ErrorText({ message }: { message: string | null }) {
  if (!message) return null;
  return <Text style={styles.error}>{message}</Text>;
}

export function StatusPill({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "success" | "action" }) {
  return (
    <View style={[styles.pill, tone === "success" && styles.pillSuccess, tone === "action" && styles.pillAction]}>
      <Text style={[styles.pillText, tone !== "neutral" && styles.pillTextDark]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.paper, padding: 16, gap: 12 },
  title: { color: tokens.ink, fontSize: 22, fontWeight: "800" },
  subtitle: { color: tokens.steel, fontSize: 13, fontWeight: "600" },
  card: {
    backgroundColor: tokens.card,
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: tokens.radiusMd,
    padding: 14,
    gap: 8,
  },
  primary: {
    backgroundColor: tokens.signal,
    borderRadius: tokens.radiusMd,
    paddingVertical: 13,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  pressed: { opacity: 0.85 },
  disabled: { opacity: 0.5 },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  error: { color: tokens.danger, fontSize: 13, fontWeight: "700" },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.lineStrong,
    paddingVertical: 3,
    paddingHorizontal: 10,
    backgroundColor: tokens.paper,
  },
  pillSuccess: { backgroundColor: tokens.confirmSoft, borderColor: tokens.confirm },
  pillAction: { backgroundColor: tokens.signalSoft, borderColor: tokens.signal },
  pillText: { fontSize: 11, fontWeight: "800", color: tokens.steel },
  pillTextDark: { color: tokens.ink },
});
