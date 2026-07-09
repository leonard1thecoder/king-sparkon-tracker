"use client";

import { useState, type ReactNode } from "react";

type LogoutButtonProps = {
  className?: string;
  children?: ReactNode;
  ariaLabel?: string;
};

export function LogoutButton({ className = "", children, ariaLabel = "Sign out" }: LogoutButtonProps) {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    window.location.href = "/login?status=signed-out";
  }

  return (
    <button type="button" onClick={signOut} disabled={busy} aria-label={ariaLabel} title={ariaLabel} className={className || "rounded-full border border-[var(--danger)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-60"}>
      {children ?? (busy ? "Signing out" : "Logout")}
    </button>
  );
}
