"use client";

import { useState } from "react";

export function LogoutButton({ className = "" }: { className?: string }) {
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    window.location.href = "/login?status=signed-out";
  }

  return (
    <button type="button" onClick={signOut} disabled={busy} className={className || "rounded-full border border-[var(--danger)] bg-white px-4 py-2 text-xs font-black uppercase tracking-[0.1em] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white disabled:opacity-60"}>
      {busy ? "Signing out" : "Logout"}
    </button>
  );
}
