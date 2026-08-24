"use client";

import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { fetchUifBenefits, normalizeUifRows, getUifBenefitRows } from "@/lib/api/uif";
import { normalizeApiError } from "@/lib/api/client";

function onlyDigits(v: string, max: number) {
  return v.replace(/\D/g, "").slice(0, max);
}

export function UifIdForm({ actionLabel, placeholderStatus }: { actionLabel: string; placeholderStatus: string }) {
  const [idNumber, setIdNumber] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPasswordStep, setShowPasswordStep] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwStatus, setPwStatus] = useState<string | null>(null);
  const [benefitRows, setBenefitRows] = useState<ReturnType<typeof getUifBenefitRows>[]>([]);
  const [benefitError, setBenefitError] = useState<string | null>(null);

  const isUpdatePassword = actionLabel.toLowerCase().includes("update") && actionLabel.toLowerCase().includes("password");
  const isCheckStatus = actionLabel.toLowerCase().includes("check");
  const idValid = idNumber.length === 13;
  const canSubmitId = idValid && !loading;

  function isStrongPassword(pw: string) {
    return pw.length >= 8 && pw.length <= 12 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
  }
  const pwValid = isStrongPassword(password);
  const confirmValid = password === confirmPassword && confirmPassword.length > 0;
  const canSubmitPw = pwValid && confirmValid && !loading;

  async function onSubmitId(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitId) return;
    if (isUpdatePassword) {
      setShowPasswordStep(true);
      setStatus(null);
      setPwStatus(null);
      return;
    }
    // Check UIF Status -> call backend GET /api/uif/benefits?idNumber=13digits
    setLoading(true);
    setStatus(null);
    setBenefitError(null);
    setBenefitRows([]);
    try {
      const response = await fetchUifBenefits(idNumber);
      const rows = normalizeUifRows(response).map(getUifBenefitRows);
      if (rows.length === 0) {
        setBenefitRows([]);
        setStatus(`No benefit history found for ID ${idNumber}.`);
      } else {
        setBenefitRows(rows);
        setStatus(`${placeholderStatus} for ID ${idNumber}. Found ${rows.length} row(s) from UIF online.`);
      }
    } catch (err) {
      const normalized = normalizeApiError(err);
      setBenefitError(normalized.message || "Failed to fetch UIF benefit history. Please try again.");
      setBenefitRows([]);
      setStatus(`Backend error for ID ${idNumber}: ${normalized.message}.`);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmitPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmitPw) return;
    setLoading(true);
    setPwStatus(null);
    await new Promise((r) => setTimeout(r, 800));
    setPwStatus(`Added to cart for ID ${idNumber} — R14.50 to pay. (Blank — integrate cart/payment here.)`);
    setStatus(`Password for ID ${idNumber} meets 8-12, 1 uppercase, 1 number, 1 special character. Added to cart for R14.50 payment.`);
    setLoading(false);
  }

  if (isUpdatePassword && showPasswordStep) {
    return (
      <div className="grid gap-5">
        <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">ID Number</p>
          <p className="mt-1 font-mono text-sm font-black text-[var(--ink)]">{idNumber}</p>
          <button type="button" onClick={() => { setShowPasswordStep(false); setPassword(""); setConfirmPassword(""); setPwStatus(null); }} className="mt-2 text-xs font-bold text-[var(--signal-strong)] hover:text-[var(--signal)]">Change ID</button>
        </div>

        <div className="rounded-xl border border-[var(--signal)]/30 bg-[var(--signal-soft)] p-4">
          <p className="text-sm font-black text-[var(--ink)]">R14.50 to pay to update password</p>
          <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Add to cart to pay the update fee. Next step is payment via cart.</p>
        </div>

        <form onSubmit={onSubmitPassword} className="grid gap-5" noValidate>
          <label className="grid gap-2">
            <span className="text-sm font-black text-[var(--ink)]">New Password <span className="font-mono text-xs font-bold text-[var(--muted)]">· 8-12, 1 uppercase, 1 number, 1 special</span></span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value.slice(0, 12))}
              placeholder="Example: King@2025"
              maxLength={12}
              className="h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:outline-none focus:ring-4 focus:ring-[var(--signal-soft)]"
              aria-describedby="pw-help"
            />
            <span id="pw-help" className={`text-xs font-semibold ${!password ? "text-[var(--muted)]" : pwValid ? "text-[var(--confirm)]" : "text-[var(--danger)]"}`}>
              {!password ? "8-12 chars, include 1 uppercase, 1 number, 1 special character." : pwValid ? "Strong password." : "Must be 8-12 with 1 uppercase, 1 number, 1 special."}
            </span>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-black text-[var(--ink)]">Confirm Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value.slice(0, 12))}
              placeholder="Repeat password"
              maxLength={12}
              className="h-12 rounded-xl border border-[var(--line)] bg-white px-4 text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:outline-none focus:ring-4 focus:ring-[var(--signal-soft)]"
            />
            <span className={`text-xs font-semibold ${!confirmPassword ? "text-[var(--muted)]" : confirmValid ? "text-[var(--confirm)]" : "text-[var(--danger)]"}`}>
              {!confirmPassword ? "Repeat the password exactly." : confirmValid ? "Passwords match." : "Passwords do not match."}
            </span>
          </label>

          <button type="submit" disabled={!canSubmitPw} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--signal-strong)] disabled:cursor-not-allowed disabled:opacity-55">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} {loading ? "Adding..." : "Add to Cart"}
          </button>

          {pwStatus ? <div className="rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] p-4 text-sm font-semibold leading-6 text-[var(--ink)]" role="status">{pwStatus}</div> : null}
          {status ? <div className="rounded-xl border border-[var(--line)] bg-[var(--confirm)]/10 p-4 text-sm font-semibold leading-6 text-[var(--confirm)]" role="status">{status}</div> : null}
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitId} className="grid gap-5" noValidate>
      {isUpdatePassword ? (
        <div className="rounded-xl border border-[var(--signal)]/30 bg-[var(--signal-soft)] p-4">
          <p className="text-sm font-black text-[var(--ink)]">R14.50 to pay to update password</p>
          <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Enter your ID to continue. You will add the update to cart and pay R14.50 before password is changed.</p>
        </div>
      ) : null}
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

      <button type="submit" disabled={!canSubmitId} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--signal-strong)] disabled:cursor-not-allowed disabled:opacity-55">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} {loading ? "Checking..." : actionLabel}
      </button>

      {status ? (
        <>
          <div className="rounded-xl border border-[var(--line)] bg-[var(--signal-soft)] p-4 text-sm font-semibold leading-6 text-[var(--ink)]" role="status">
            {status}
          </div>
          {isCheckStatus ? (
            <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
              <div className="border-b border-[var(--line)] bg-[var(--surface)] px-4 py-3">
                <h3 className="text-sm font-black tracking-[-0.02em] text-[var(--ink)]">Application for Benefit History</h3>
              </div>
              {benefitError ? <div className="border-b border-[var(--danger)]/20 bg-[var(--danger)]/5 px-4 py-2 text-xs font-bold text-[var(--danger)]">{benefitError}</div> : null}
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--line)] bg-white">
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">ID Number</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">Benefit Type</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">Application Number</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">Application Date</th>
                      <th className="px-4 py-3 text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">Claim Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {benefitRows.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-sm font-semibold text-[var(--muted)]">No benefit history to display. Submit a valid ID to fetch straight from UIF online.</td>
                      </tr>
                    ) : (
                      benefitRows.map((row, idx) => (
                        <tr key={idx} className="border-b border-[var(--line)] last:border-0">
                          <td className="px-4 py-3 font-mono text-sm font-bold text-[var(--ink)]">{row.idNumber || idNumber}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-[var(--steel)]">{row.benefitType || "-"}</td>
                          <td className="px-4 py-3 font-mono text-sm font-bold text-[var(--ink)]">{row.applicationNumber || "-"}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-[var(--steel)]">{row.applicationDate || "-"}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex rounded-full border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 px-2.5 py-1 text-xs font-black text-[var(--confirm)]">{row.claimStatus || "-"}</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <p className="border-t border-[var(--line)] bg-[var(--surface)]/60 px-4 py-2 text-xs font-semibold text-[var(--muted)]">Data source: <a href="https://uifonline.labour.gov.za" target="_blank" rel="noopener noreferrer" className="font-bold text-[var(--signal-strong)] hover:underline">https://uifonline.labour.gov.za</a></p>
            </div>
          ) : null}
        </>
      ) : null}
    </form>
  );
}
