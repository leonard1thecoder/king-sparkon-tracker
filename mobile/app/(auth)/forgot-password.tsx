import { useState } from "react";
import { View } from "react-native";
import { forgotPasswordRequest } from "@/lib/api";
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

// Mirrors web `/forgot-password`: same copy, email field and messages.
export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function onSubmit() {
    if (!email.trim()) {
      setStatus({ tone: "error", message: "Complete email address before submitting." });
      return;
    }
    if (!email.includes("@")) {
      setStatus({ tone: "error", message: "Enter a valid email address." });
      return;
    }
    setBusy(true);
    setStatus(null);
    try {
      await forgotPasswordRequest(email.trim());
      setStatus({ tone: "success", message: "If the account exists, a reset link has been sent." });
      setEmail("");
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
        <AuthEyebrow>Password recovery</AuthEyebrow>
        <AuthTitle>Reset access safely</AuthTitle>
        <AuthDescription>
          Enter the email tied to your barcode inventory account and prepare a secure reset step for your business workspace.
        </AuthDescription>
      </View>
      <AuthCard>
        <AuthField
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="you@example.com"
          keyboardType="email-address"
        />
        {status ? <AuthStatus tone={status.tone} message={status.message} /> : null}
        <AuthSubmit title="Send reset link" busy={busy} onPress={() => void onSubmit()} />
      </AuthCard>
      <AuthFooter text="Remembered your password?" href="/(auth)/login" link="Back to sign in" />
    </AuthScreen>
  );
}
