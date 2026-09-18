import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Link } from "expo-router";
import { useState } from "react";
import { tokens } from "@/theme/tokens";

// Shared auth UI — mirrors web `AuthShell` + `InteractiveRegisterShell`
// (paper background, brand block, eyebrow pill, card form, status banner,
// signal submit, footer link). Copy, labels, placeholders and helpers match
// the website verbatim; only the role picker is gone (mobile is User-only).

export function AuthScreen({ children }: { children: ReactNode }) {
  return <View style={styles.screen}>{children}</View>;
}

export function AuthBrand() {
  return (
    <View style={styles.brand}>
      <Text style={styles.brandEyebrow}>King Sparkon</Text>
      <Text style={styles.brandName}>Tracker</Text>
    </View>
  );
}

export function AuthEyebrow({ children }: { children: ReactNode }) {
  return (
    <View style={styles.eyebrow}>
      <Text style={styles.eyebrowText}>{children}</Text>
    </View>
  );
}

export function AuthTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function AuthDescription({ children }: { children: ReactNode }) {
  return <Text style={styles.description}>{children}</Text>;
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function AuthNote({ children }: { children: ReactNode }) {
  return (
    <View style={styles.note}>
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

export function AuthStatus({ tone, message }: { tone: "success" | "error"; message: string | null }) {
  if (!message) return null;
  return (
    <View style={[styles.status, tone === "success" ? styles.statusSuccess : styles.statusError]}>
      <Text style={[styles.statusText, tone === "success" ? styles.statusTextSuccess : styles.statusTextError]}>
        {message}
      </Text>
    </View>
  );
}

export function AuthFooter({ text, href, link }: { text: string; href: string; link: string }) {
  return (
    <View style={styles.footer}>
      <Text style={styles.footerText}>
        {text}{" "}
        <Link href={href} style={styles.footerLink}>
          {link}
        </Link>
      </Text>
    </View>
  );
}

export function AuthField({
  label,
  value,
  onChange,
  placeholder,
  helper,
  secure,
  keyboardType,
  autoCapitalize = "none",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder: string;
  helper?: string;
  secure?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad" | "number-pad";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
}) {
  const [hidden, setHidden] = useState(Boolean(secure));
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputRow}>
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          style={styles.input}
        />
        {secure ? (
          <Pressable onPress={() => setHidden((v) => !v)} accessibilityLabel={hidden ? "Show password" : "Hide password"}>
            <Text style={styles.toggle}>{hidden ? "Show" : "Hide"}</Text>
          </Pressable>
        ) : null}
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

export function AuthChoice<T extends string>({
  label,
  helper,
  options,
  value,
  onChange,
}: {
  label: string;
  helper?: string;
  options: { label: string; value: T }[];
  value: T | "";
  onChange: (next: T) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              style={[styles.chip, selected && styles.chipActive]}
            >
              <Text style={[styles.chipText, selected && styles.chipTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
}

export function AuthSubmit({ title, busy, onPress }: { title: string; busy: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={busy}
      style={[styles.submit, busy && styles.submitBusy]}
      accessibilityRole="button"
    >
      <Text style={styles.submitText}>{busy ? "Submitting..." : title}</Text>
    </Pressable>
  );
}

export function AuthCheckbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (next: boolean) => void }) {
  return (
    <Pressable onPress={() => onChange(!checked)} accessibilityRole="checkbox" accessibilityState={{ checked }} style={styles.checkbox}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </View>
      <Text style={styles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: tokens.paper, padding: 16, gap: 12 },
  brand: { marginTop: 24 },
  brandEyebrow: { color: tokens.signal, fontSize: 11, fontWeight: "900", letterSpacing: 2, textTransform: "uppercase" },
  brandName: { color: tokens.ink, fontSize: 22, fontWeight: "900", textTransform: "uppercase" },
  eyebrow: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: tokens.line,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  eyebrowText: { color: tokens.steel, fontSize: 11, fontWeight: "900", letterSpacing: 1.5, textTransform: "uppercase" },
  title: { color: tokens.ink, fontSize: 26, fontWeight: "900", letterSpacing: -0.5 },
  description: { color: tokens.steel, fontSize: 14, lineHeight: 22, fontWeight: "600" },
  card: { backgroundColor: "#fff", borderColor: tokens.line, borderWidth: 1, borderRadius: 16, padding: 16, gap: 14 },
  note: { borderWidth: 1, borderColor: "#E4C566", backgroundColor: "#FDF6E3", borderRadius: 14, padding: 12 },
  noteText: { color: tokens.steel, fontSize: 13, fontWeight: "600", lineHeight: 20 },
  status: { borderWidth: 1, borderRadius: 14, padding: 12 },
  statusSuccess: { borderColor: tokens.confirm, backgroundColor: tokens.confirmSoft },
  statusError: { borderColor: tokens.danger, backgroundColor: "#FDECEA" },
  statusText: { fontSize: 13, fontWeight: "700", lineHeight: 20 },
  statusTextSuccess: { color: tokens.confirm },
  statusTextError: { color: tokens.danger },
  footer: { backgroundColor: tokens.card, borderColor: tokens.line, borderWidth: 1, borderRadius: 14, padding: 14 },
  footerText: { color: tokens.steel, fontSize: 13, fontWeight: "700" },
  footerLink: { color: tokens.signalStrong, fontWeight: "900" },
  field: { gap: 6 },
  fieldLabel: { color: tokens.ink, fontSize: 14, fontWeight: "900" },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 12,
  },
  input: { flex: 1, paddingVertical: 12, fontSize: 15, fontWeight: "600", color: tokens.ink },
  toggle: { color: tokens.signalStrong, fontWeight: "800", fontSize: 13, paddingLeft: 8 },
  helper: { color: tokens.steel, fontSize: 12, fontWeight: "600", lineHeight: 18 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: tokens.line, borderRadius: 999, paddingVertical: 10, paddingHorizontal: 16, backgroundColor: "#fff" },
  chipActive: { backgroundColor: tokens.ink, borderColor: tokens.ink },
  chipText: { fontWeight: "800", fontSize: 13, color: tokens.steel },
  chipTextActive: { color: "#fff" },
  submit: { backgroundColor: tokens.signal, borderRadius: 999, paddingVertical: 13, alignItems: "center" },
  submitBusy: { opacity: 0.6 },
  submitText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  checkbox: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: tokens.lineStrong, backgroundColor: "#fff", alignItems: "center", justifyContent: "center" },
  boxChecked: { backgroundColor: tokens.signal, borderColor: tokens.signal },
  tick: { color: "#fff", fontWeight: "900", fontSize: 13 },
  checkboxLabel: { flex: 1, color: tokens.steel, fontSize: 13, fontWeight: "600", lineHeight: 20 },
});
