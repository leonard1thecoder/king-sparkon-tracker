"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { PasswordField, StatusNote, TextField, primaryButtonClass } from "@/components/auth/AuthFields";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type Status = { tone: "error" | "success"; message: string } | null;

// Same endpoint and payload as the previous reset form: token, newPassword and confirmPassword.
export function ResetPasswordForm({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = {
      token: String(form.get("token") ?? "").trim(),
      newPassword: String(form.get("newPassword") ?? "").trim(),
      confirmPassword: String(form.get("confirmPassword") ?? "").trim(),
    };

    if (!payload.token) return setStatus({ tone: "error", message: "Complete reset token before submitting." });
    if (!payload.newPassword) return setStatus({ tone: "error", message: "Complete new password before submitting." });
    if (!payload.confirmPassword) return setStatus({ tone: "error", message: "Complete confirm password before submitting." });
    if (payload.newPassword !== payload.confirmPassword) {
      return setStatus({ tone: "error", message: "New password and confirmation must match." });
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await axios.post("/api/auth/reset-password", payload, { withCredentials: true });
      setStatus({ tone: "success", message: "Password reset successful. You can now sign in." });
      window.setTimeout(() => {
        window.location.href = "/login";
      }, 700);
    } catch (error) {
      setStatus({
        tone: "error",
        message: axios.isAxiosError(error) ? messageFromBackendPayload(error.response?.data) : "Unable to reach the auth API.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-sm font-semibold text-[var(--ks-muted)]">Choose new password</p>
      <h1 className="mt-2 text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--ks-ink)]">Create a fresh password</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">Use your reset code and set a new password for your King Sparkon account.</p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
        <TextField name="token" label="Reset token" autoComplete="one-time-code" defaultValue={token} placeholder="Paste your reset token" />
        <PasswordField name="newPassword" label="New password" autoComplete="new-password" placeholder="Create a new password" />
        <PasswordField name="confirmPassword" label="Confirm password" autoComplete="new-password" placeholder="Repeat your new password" />

        {status ? <StatusNote tone={status.tone} message={status.message} /> : null}

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Updating…" : "Update password"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--ks-muted)]">
        Need another reset link?{" "}
        <Link href="/forgot-password" className="font-bold text-[var(--ks-ink)] underline-offset-4 hover:underline">
          Request one
        </Link>
      </p>
    </div>
  );
}
