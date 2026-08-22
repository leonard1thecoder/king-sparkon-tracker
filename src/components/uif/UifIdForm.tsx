"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

function onlyDigits(v: string, max: number) {
  return v.replace(/\D/g, "").slice(0, max);
}

export function UifIdForm({ actionLabel, placeholderStatus }: { actionLabel: string; placeholderStatus: string }) {
  const [idNumber, setIdNumber] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const idValid = idNumber.length === 13;
  const canSubmit = idValid && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setStatus(null);
    await new Promise((r) => setTimeout(r, 800));
    setStatus(`${placeholderStatus} for ID ${idNumber}. (Blank page — integrate UIF API here.)`);
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-5" noValidate>
      <label className="grid gap-2">
        <span className="text-sm font-black text-[var(--ink)]">ID Number <span className="font-mono text-xs font-bold text-[var(--muted)]">· 13 digits</span></span>
        <input
          value={idNumber}
          onChange={(e) => setIdNumber(onlyDigits(e.target.value, 13))}
          inputMode="numeric"
          pattern="\d*"
          maxLength={13}
          placeholder="8001015009087"
          className="h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-mono text-[15px] tracking-wide text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:outline-none focus:ring-4 focus:ring-[var(--signal-soft)]"
          aria-invalid={idNumber.length > 0 && !idValid}
          aria-describedby="uif-id-help"
        />
        <span id="uif-id-help" className={`text-xs font-semibold ${idNumber.length === 0 ? "text-[var(--muted)]" : idValid ? "text-[var(--confirm)]" : "text-[var(--danger)]"}`}>
          {idNumber.length === 0 ? "Enter 13-digit South African ID." : idValid ? "Valid 13 digits." : `${idNumber.length}/13 digits`}
        </span>
      </label>

      <button type="submit" disabled={!canSubmit} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--signal-strong)] disabled:cursor-not-allowed disabled:opacity-55">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} {loading ? "Checking..." : actionLabel}
      </button>

      {status ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] p-4 text-sm font-semibold leading-6 text-[var(--ink)]" role="status">
          {status}
        </div>
      ) : null}
    </form>
  );
}
