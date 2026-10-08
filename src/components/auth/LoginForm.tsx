"use client";

import axios from "axios";
import Link from "next/link";
import { type FormEvent, useState } from "react";
import { OAuthButtons } from "@/components/auth/OAuthButtons";
import { PasswordField, StatusNote, TextField, primaryButtonClass } from "@/components/auth/AuthFields";
import { messageFromBackendPayload } from "@/lib/utils/errors";

type Status = { tone: "error" | "success"; message: string } | null;

export function LoginForm({ oauthErrorCode }: { oauthErrorCode?: string }) {
  const [status, setStatus] = useState<Status>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!username || !password) {
      setStatus({ tone: "error", message: !username ? "Enter your email or username." : "Enter your password." });
      return;
    }

    setSubmitting(true);
    setStatus(null);
    try {
      // Same request body as the previous login form: /api/auth/login with username and password.
      await axios.post("/api/auth/login", { username, password }, { withCredentials: true });
      setStatus({ tone: "success", message: "Signed in. Opening your dashboard." });
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 400);
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
      <p className="text-sm font-semibold text-[var(--ks-muted)]">Welcome back</p>
      <h1 className="mt-2 text-[2rem] font-extrabold leading-tight tracking-tight text-[var(--ks-ink)]">Sign in to King Sparkon</h1>

      <form onSubmit={onSubmit} noValidate className="mt-8 grid gap-5">
        <TextField name="username" label="Email or username" autoComplete="username" />
        <PasswordField name="password" label="Password" autoComplete="current-password" />

        {status ? <StatusNote tone={status.tone} message={status.message} /> : null}

        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="font-semibold text-[var(--ks-ink)] underline-offset-4 hover:underline">
          Forgot password?
        </Link>
      </p>

      <div className="mt-8">
        <OAuthButtons errorCode={oauthErrorCode} tone="light" />
      </div>

      <p className="mt-8 text-center text-sm text-[var(--ks-muted)]">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-bold text-[var(--ks-ink)] underline-offset-4 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}
