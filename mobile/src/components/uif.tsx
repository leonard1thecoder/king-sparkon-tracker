import { StyleSheet, Text, TextInput } from "react-native";
import { tokens } from "@/theme/tokens";

// 13-digit SA ID enforcement — mirrors web `UifIdForm` (blocks non-digits).
export function UifIdInput({ value, onChange }: { value: string; onChange: (next: string) => void }) {
  return (
    <TextInput
      value={value}
      onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, 13))}
      keyboardType="number-pad"
      maxLength={13}
      placeholder="13-digit ID number"
      style={styles.input}
    />
  );
}

export function isValidUifId(value: string) {
  return /^\d{13}$/.test(value.trim());
}

export function UifHint({ children }: { children: string }) {
  return <Text style={styles.hint}>{children}</Text>;
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: "#fff",
    borderColor: tokens.line,
    borderWidth: 1,
    borderRadius: tokens.radiusMd,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: tokens.ink,
  },
  hint: { color: tokens.steel, fontSize: 12, fontWeight: "600" },
});
