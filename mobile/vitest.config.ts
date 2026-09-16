import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

const testMock = (name: string) => fileURLToPath(new URL(`./src/test/mocks/${name}.ts`, import.meta.url));

export default defineConfig({
  resolve: {
    // Expo native packages contain Flow syntax that Vite cannot parse in the
    // Node test runtime. Contract tests only need these platform boundaries.
    alias: {
      "expo-constants": testMock("expo-constants"),
      "expo-secure-store": testMock("expo-secure-store"),
      "react-native": testMock("react-native"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
