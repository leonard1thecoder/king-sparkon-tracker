import { Image, StyleSheet, View } from "react-native";
import LogoImage from "../../assets/splash-logo.png";

/** How long the startup splash stays visible (7 seconds). */
export const STARTUP_SPLASH_DURATION_MS = 7000;

/** Full-screen startup loader: logo only, centered. */
export function StartupSplash() {
  return (
    <View style={styles.screen}>
      <Image
        source={LogoImage}
        style={styles.logo}
        resizeMode="contain"
        accessible
        accessibilityRole="image"
        accessibilityLabel="King Sparkon logo"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
    elevation: 10,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    width: 340,
    height: 150,
  },
});
