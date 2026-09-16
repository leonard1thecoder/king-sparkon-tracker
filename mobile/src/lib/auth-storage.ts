import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const ACCESS_KEY = "kst.accessToken";
const REFRESH_KEY = "kst.refreshToken";

// SecureStore is unavailable on web — fall back to in-memory storage there
// so Expo web export and tests keep working.
const memory = new Map<string, string>();

async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    memory.set(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return memory.get(key) ?? null;
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (Platform.OS === "web") {
    memory.delete(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveTokens(tokens: { accessToken?: string; refreshToken?: string }): Promise<void> {
  if (tokens.accessToken) await setItem(ACCESS_KEY, tokens.accessToken);
  if (tokens.refreshToken) await setItem(REFRESH_KEY, tokens.refreshToken);
}

export async function getAccessToken(): Promise<string | null> {
  return getItem(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return getItem(REFRESH_KEY);
}

export async function clearTokens(): Promise<void> {
  await deleteItem(ACCESS_KEY);
  await deleteItem(REFRESH_KEY);
}
