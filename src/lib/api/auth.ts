import axios from "axios";
import type { AuthResponse } from "@/lib/types/auth";

const authClient = axios.create({ baseURL: "/api/auth", withCredentials: true });

export async function login(values: Record<string, string>) {
  const response = await authClient.post<AuthResponse>("/login", values);
  return response.data;
}

export async function registerOwner(values: Record<string, string>) {
  const response = await authClient.post<AuthResponse>("/register", values);
  return response.data;
}

export async function registerAffiliate(values: Record<string, string>) {
  const response = await authClient.post<AuthResponse>("/register-affiliate", values);
  return response.data;
}

export async function forgotPassword(emailAddress: string) {
  const response = await authClient.post("/forgot-password", { emailAddress });
  return response.data;
}

export async function resetPassword(values: Record<string, string>) {
  const response = await authClient.post("/reset-password", values);
  return response.data;
}

export async function resendVerification(emailAddress: string) {
  const response = await authClient.post("/resend-verification", { emailAddress });
  return response.data;
}

export async function logout() {
  const response = await authClient.post("/logout");
  return response.data;
}
