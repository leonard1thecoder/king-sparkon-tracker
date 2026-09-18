import { useState } from "react";
import { View } from "react-native";
import { resendVerificationRequest } from "@/lib/api";
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

// Mirrors web `/resend-verification`: same copy, email field and messages.
export default function ResendVerificationScreen() {
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
      await resendVerificationRequest(email.trim());
      setStatus({ tone: "success", message: "If the account needs verification, a new link has been sent." });
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
        <AuthEyebrow>Email verification</AuthEyebrow>
        <AuthTitle>Send a new verification link</AuthTitle>
        <AuthDescription>
          Use the same email address you registered with and request a fresh verification email for your barcode inventory workspace.
        </AuthDescription>
      </View>
      <AuthCard>
        <AuthField
          label="Email address"
          value={email}
          onChange={setEmail}
          placeholder="owner@outlook.com"
          keyboardType="email-address"
        />
        {status ? <AuthStatus tone={status.tone} message={status.message} /> : null}
        <AuthSubmit title="Send verification" busy={busy} onPress={() => void onSubmit()} />
      </AuthCard>
      <AuthFooter text="Already verified?" href="/(auth)/login" link="Back to sign in" />
    </AuthScreen>
  );
}
