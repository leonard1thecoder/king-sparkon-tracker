import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { tokens } from "@/theme/tokens";
import LogoImage from "../../assets/icon.png";

/** Guest header: logo plus Sign in / Sign up actions (no auth-only buttons). */
export function PublicHeader() {
  return (
    <View style={styles.header}>
      <Image
        source={LogoImage}
        style={styles.logo}
        resizeMode="contain"
        accessibilityRole="image"
        accessibilityLabel="King Sparkon logo"
      />
      <View style={styles.actions}>
        <Link href="/(auth)/login" asChild>
          <Pressable style={styles.signIn} accessibilityRole="button" accessibilityLabel="Sign in">
            <Text style={styles.signInText}>Sign in</Text>
          </Pressable>
        </Link>
        <Link href="/(auth)/register" asChild>
          <Pressable style={styles.signUp} accessibilityRole="button" accessibilityLabel="Sign up">
            <Text style={styles.signUpText}>Sign up</Text>
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#fff",
    borderBottomColor: tokens.line,
    borderBottomWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: { width: 120, height: 53 },
  actions: { flexDirection: "row", gap: 8, alignItems: "center" },
  signIn: {
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: tokens.line,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  signInText: { color: tokens.ink, fontWeight: "800", fontSize: 13 },
  signUp: {
    minHeight: 40,
    borderRadius: 999,
    backgroundColor: tokens.signal,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  signUpText: { color: "#fff", fontWeight: "800", fontSize: 13 },
});
