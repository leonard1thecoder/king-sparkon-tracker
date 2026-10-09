"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { StatusNote, TextField, primaryButtonClass } from "@/components/auth/AuthFields";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type Status = { tone: "error" | "success"; message: string } | null;

// Same endpoint and payload as the previous recovery form: /api/auth/forgot-password with emailAddress.
export function ForgotPasswordForm() {
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const emailAddress = String(new FormData(form).get("emailAddress") ?? "").trim();

    if (!emailAddress) {
      setStatus({ tone: "error", message: "Complete email address before submitting." });
      return;
    }
    if (!emailAddress.includes("@")) {
      setStatus({ tone: "error", message: "Enter a valid email address." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      await axios.post("/api/auth/forgot-password", { emailAddress }, { withCredentials: true });
      setStatus({ tone: "success", message: "If the account exists, a reset link has been sent." });
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
      <p className="text-sm font-semibold text-[var(--ks-muted)]">Password recovery</p>
      <h1 className="mt-2 text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--ks-ink)]">Reset your password</h1>
      <p className="mt-3 text-sm leading-6 text-[var(--ks-muted)]">
        Enter the email tied to your barcode inventory account and we will send a reset link.
      </p>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
        <TextField name="emailAddress" label="Email address" type="email" autoComplete="email" placeholder="you@example.com" />

        {status ? <StatusNote tone={status.tone} message={status.message} /> : null}

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--ks-muted)]">
        Remembered your password?{" "}
        <Link href="/login" className="font-bold text-[var(--ks-ink)] underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
