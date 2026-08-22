"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";

function onlyDigits(v: string, max: number) {
  return v.replace(/\D/g, "").slice(0, max);
}

export function SassaStatusForm() {
  const [idNumber, setIdNumber] = useState("");
  const [cellphone, setCellphone] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const idValid = idNumber.length === 13;
  const cellValid = cellphone.length === 10;
  const canSubmit = idValid && cellValid && !loading;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setStatus(null);
    // Placeholder: no external redirect, just blank handling
    await new Promise((r) => setTimeout(r, 800));
    setStatus(`Checked SASSA 370 status for ID ${idNumber} and cellphone ${cellphone}. (Blank page — integrate SRD API here.)`);
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
          aria-describedby="sassa-id-help"
        />
        <span id="sassa-id-help" className={`text-xs font-semibold ${idNumber.length === 0 ? "text-[var(--muted)]" : idValid ? "text-[var(--confirm)]" : "text-[var(--danger)]"}`}>
          {idNumber.length === 0 ? "Enter 13-digit South African ID." : idValid ? "Valid 13 digits." : `${idNumber.length}/13 digits`}
        </span>
      </label>

      <label className="grid gap-2">
        <span className="text-sm font-black text-[var(--ink)]">Cellphone Number <span className="font-mono text-xs font-bold text-[var(--muted)]">· 10 digits</span></span>
        <input
          value={cellphone}
          onChange={(e) => setCellphone(onlyDigits(e.target.value, 10))}
          inputMode="numeric"
          pattern="\d*"
          maxLength={10}
          placeholder="0824557712"
          className="h-12 rounded-xl border border-[var(--line)] bg-white px-4 font-mono text-[15px] tracking-wide text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:outline-none focus:ring-4 focus:ring-[var(--signal-soft)]"
          aria-invalid={cellphone.length > 0 && !cellValid}
          aria-describedby="sassa-cell-help"
        />
        <span id="sassa-cell-help" className={`text-xs font-semibold ${cellphone.length === 0 ? "text-[var(--muted)]" : cellValid ? "text-[var(--confirm)]" : "text-[var(--danger)]"}`}>
          {cellphone.length === 0 ? "Enter 10-digit cellphone, e.g. 0824557712." : cellValid ? "Valid 10 digits." : `${cellphone.length}/10 digits`}
        </span>
      </label>

      <button type="submit" disabled={!canSubmit} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--signal-strong)] disabled:cursor-not-allowed disabled:opacity-55">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} {loading ? "Checking..." : "Check SASSA 370 Status"}
      </button>

      {status ? (
        <div className="rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] p-4 text-sm font-semibold leading-6 text-[var(--ink)]" role="status">
          {status}
        </div>
      ) : null}
    </form>
  );
}
