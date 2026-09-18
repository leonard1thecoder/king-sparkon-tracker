import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { resetPasswordRequest } from "@/lib/api";
import {
  AuthBrand,
  AuthCard,
  AuthDescription,
  AuthEyebrow,
  AuthField,
  AuthFooter,
  AuthScreen,
  AuthStatus,
  AuthSubmit,
  AuthTitle,
} from "@/components/auth";

// Mirrors web `/reset-password`: reset token (prefilled from link when
// present), new password + confirmation with match check, then sign in.
export default function ResetPasswordScreen() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(Array.isArray(tokenParam) ? tokenParam[0] ?? "" : tokenParam ?? "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function onSubmit() {
    if (!token.trim()) {
      setStatus({ tone: "error", message: "Complete reset token before submitting." });
      return;
    }
    if (!password) {
      setStatus({ tone: "error", message: "Complete new password before submitting." });
      return;
    }
    if (password !== confirm) {
      setStatus({ tone: "error", message: "New password and confirmation must match." });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await resetPasswordRequest({ token: token.trim(), newPassword: password, confirmPassword: confirm });
      setStatus({ tone: "success", message: "Password reset successful. You can now sign in." });
      setPassword("");
      setConfirm("");
      setTimeout(() => router.replace("/(auth)/login"), 700);
    } catch (e) {
      setStatus({ tone: "error", message: e instanceof Error ? e.message : "Unable to reach the auth API." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthScreen>
      <AuthBrand />
      <View>
        <AuthEyebrow>Choose new password</AuthEyebrow>
        <AuthTitle>Create a fresh password</AuthTitle>
        <AuthDescription>
          Use your reset code and set a new password that protects barcode inventory, product stock movement, claims, reports, and billing.
        </AuthDescription>
      </View>
      <AuthCard>
        <AuthField
          label="Reset token"
          value={token}
          onChange={setToken}
          placeholder="Paste reset token"
          helper="From the reset email. It is prefilled when you open the email link in the app."
        />
        <AuthField
          label="New password"
          value={password}
          onChange={setPassword}
          placeholder="Create a new password"
          secure
        />
        <AuthField
          label="Confirm password"
          value={confirm}
          onChange={setConfirm}
          placeholder="Repeat new password"
          secure
        />
        {status ? <AuthStatus tone={status.tone} message={status.message} /> : null}
        <AuthSubmit title="Update password" busy={busy} onPress={() => void onSubmit()} />
      </AuthCard>
      <AuthFooter text="Need another reset link?" href="/(auth)/forgot-password" link="Request one" />
    </AuthScreen>
  );
}
