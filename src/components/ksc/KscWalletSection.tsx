"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { BadgePercent, History, Loader2, Plus, RefreshCw, ShieldCheck, Wallet } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import {
  authorizeKscPayment,
  cancelKscPayment,
  captureKscPayment,
  createKscMandate,
  createKscTopUp,
  getKscTopUp,
  getKscWallet,
  listKscMandates,
  listKscTransactions,
  refundKscPayment,
  revokeKscMandate,
} from "@/lib/api/ksc";
import { canSpendKsc, formatKsc, formatKscZar, kscEntryLabel, kscEntrySign, validateTopUpAmount } from "@/lib/ksc";
import type { KscMandate, KscPayment, KscTopUp, KscTransaction, KscWallet } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { StatusPill } from "@/components/ui/StatusPill";
import { Toast } from "@/components/ui/Toast";

const inputClass = "min-h-11 w-full rounded-[1rem] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none focus:border-[var(--signal)]";
const labelClass = "grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]";

/**
 * First-class KSC wallet section. ZAR earnings are never shown or touched
 * here — KSC is a separate financial domain (1 KSC = R1.00, configurable).
 */
export function KscWalletSection({ title = "KSC Wallet", description = "King Sparkon Coin for AI/MCP payments and King Sparkon services. Separate from ZAR earnings." }: { title?: string; description?: string }) {
  const [wallet, setWallet] = useState<KscWallet | null>(null);
  const [transactions, setTransactions] = useState<KscTransaction[]>([]);
  const [mandates, setMandates] = useState<KscMandate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [mandateOpen, setMandateOpen] = useState(false);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [liveWallet, liveTx, liveMandates] = await Promise.all([
        getKscWallet(),
        listKscTransactions().catch(() => [] as KscTransaction[]),
        listKscMandates().catch(() => [] as KscMandate[]),
      ]);
      setWallet(liveWallet);
      setTransactions(Array.isArray(liveTx) ? liveTx : []);
      setMandates(Array.isArray(liveMandates) ? liveMandates : []);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function flash(message: string) {
    setToast(message);
    setTimeout(() => setToast(""), 4000);
  }

  if (loading) {
    return (
      <Card className="p-6">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading KSC wallet…</p>
      </Card>
    );
  }

  return (
    <section className="grid gap-4">
      <Card className="overflow-hidden border-[var(--signal)]/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Wallet className="h-5 w-5 text-[var(--signal)]" /> {title}</CardTitle>
          <p className="mt-1 text-sm font-semibold text-[var(--steel)]">{description}</p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {error ? <p className="rounded-[1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3 text-sm font-black text-[var(--danger)]">{error}</p> : null}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Available</p>
              <p className="money mt-1 text-2xl font-black">{formatKsc(wallet?.availableBalance)}</p>
              <p className="text-xs font-bold text-[var(--steel)]">Spendable now</p>
            </div>
            <div className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Reserved</p>
              <p className="money mt-1 text-2xl font-black">{formatKsc(wallet?.reservedBalance)}</p>
              <p className="text-xs font-bold text-[var(--steel)]">Locked in authorizations</p>
            </div>
            <div className="rounded-[1rem] border border-[var(--signal)]/40 bg-[var(--signal-soft)] p-4">
              <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Total</p>
              <p className="money mt-1 text-2xl font-black">{formatKsc((wallet?.availableBalance ?? 0) + (wallet?.reservedBalance ?? 0))}</p>
              <p className="text-xs font-bold text-[var(--steel)]">≈ {formatKscZar(wallet?.zarEquivalent)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setTopUpOpen(true)}><Plus className="h-4 w-4" /> Top Up</Button>
            <Button type="button" variant="quiet" onClick={() => setPayOpen(true)}><BadgePercent className="h-4 w-4" /> New Payment</Button>
            <Button type="button" variant="quiet" onClick={() => void load()}><RefreshCw className="h-4 w-4" /> Refresh</Button>
          </div>
          <p className="text-xs font-semibold text-[var(--muted)]">KSC never mixes with ZAR earnings, withdrawals, tips or payouts.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-[var(--signal)]" /> Transactions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {transactions.length === 0 ? <p className="text-sm font-semibold text-[var(--steel)]">No KSC transactions yet. Top up to get started.</p> :
            transactions.slice(0, 20).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 rounded-[1rem] border border-[var(--line)] bg-white px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{kscEntryLabel(tx.entryType)}</p>
                  <p className="truncate text-xs font-semibold text-[var(--steel)]">{tx.description ?? tx.providerReference ?? tx.createdAt ?? ""}</p>
                </div>
                <p className={`money shrink-0 text-sm font-black ${kscEntrySign(tx) < 0 ? "text-[var(--danger)]" : "text-[var(--confirm)]"}`}>
                  {kscEntrySign(tx) < 0 ? "−" : "+"}{formatKsc(Math.abs(Number(tx.amount ?? 0)))}
                </p>
              </div>
            ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[var(--signal)]" /> AI Spending Mandates</CardTitle>
            <p className="mt-1 text-sm font-semibold text-[var(--steel)]">Agents spend only within your limits — never your bank credentials.</p>
          </div>
          <Button type="button" variant="quiet" onClick={() => setMandateOpen(true)}><Plus className="h-4 w-4" /> New Mandate</Button>
        </CardHeader>
        <CardContent className="grid gap-2">
          {mandates.length === 0 ? <p className="text-sm font-semibold text-[var(--steel)]">No mandates. Direct payments need none; agent payments require one.</p> :
            mandates.map((mandate) => (
              <MandateRow key={mandate.id} mandate={mandate} acting={acting} onRevoke={async () => {
                setActing(`mandate-${mandate.id}`);
                try {
                  await revokeKscMandate(mandate.id);
                  flash(`Mandate for ${mandate.agentId} revoked.`);
                  await load();
                } catch (exception) {
                  setError(normalizeApiError(exception).message);
                } finally {
                  setActing(null);
                }
              }} />
            ))}
        </CardContent>
      </Card>

      <TopUpDialog open={topUpOpen} onClose={() => setTopUpOpen(false)} onDone={(message) => { flash(message); void load(); }} />
      <PaymentDialog open={payOpen} wallet={wallet} onClose={() => setPayOpen(false)} onDone={(message) => { flash(message); void load(); }} />
      <MandateDialog open={mandateOpen} onClose={() => setMandateOpen(false)} onDone={(message) => { flash(message); void load(); }} />

      {toast ? <Toast message={toast} tone="confirm" /> : null}
    </section>
  );
}

function MandateRow({ mandate, acting, onRevoke }: { mandate: KscMandate; acting: string | null; onRevoke: () => void }) {
  return (
    <div className="grid gap-2 rounded-[1rem] border border-[var(--line)] bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-black">{mandate.agentId}</p>
        <StatusPill label={mandate.status} tone={mandate.status === "ACTIVE" ? "confirm" : "neutral"} />
        {mandate.status === "ACTIVE" ? (
          <Button type="button" variant="quiet" disabled={acting === `mandate-${mandate.id}`} onClick={onRevoke}>
            {acting === `mandate-${mandate.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Revoke
          </Button>
        ) : null}
      </div>
      <p className="text-xs font-bold text-[var(--steel)]">
        Max/tx {formatKsc(mandate.maxPerTransaction)} · Daily {Number(mandate.dailyLimit) > 0 ? formatKsc(mandate.dailyLimit) : "uncapped"} · Monthly {Number(mandate.monthlyLimit) > 0 ? formatKsc(mandate.monthlyLimit) : "uncapped"}
      </p>
      {(mandate.allowedTools?.length ?? 0) > 0 || (mandate.allowedMerchants?.length ?? 0) > 0 ? (
        <p className="text-xs font-semibold text-[var(--muted)]">
          {[mandate.allowedTools?.length ? `Tools: ${mandate.allowedTools.join(", ")}` : null, mandate.allowedMerchants?.length ? `Merchants: ${mandate.allowedMerchants.join(", ")}` : null].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </div>
  );
}

function TopUpDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (message: string) => void }) {
  const [amount, setAmount] = useState("500");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [topUp, setTopUp] = useState<KscTopUp | null>(null);
  const [checking, setChecking] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validation = validateTopUpAmount(Number(amount));
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await createKscTopUp({ amountZar: Number(amount) });
      setTopUp(created);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function refreshStatus() {
    if (!topUp) return;
    setChecking(true);
    try {
      const current = await getKscTopUp(topUp.id);
      setTopUp(current);
      if (current.status === "COMPLETED") {
        onDone(`Top-up complete: ${formatKsc(current.amountKsc)} credited.`);
        setTopUp(null);
        onClose();
      }
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <Modal open={open} title="Top Up KSC" onClose={() => { setTopUp(null); setError(null); onClose(); }}>
      {!topUp ? (
        <form onSubmit={submit} className="grid gap-4">
          <p className="text-sm font-semibold text-[var(--steel)]">Pay ZAR via PayFast at 1 KSC = R1.00. KSC credits only after the provider confirms — never on button click.</p>
          <label className={labelClass}>Amount (ZAR)<input type="number" min={10} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} placeholder="500" /></label>
          {error ? <p className="text-sm font-black text-[var(--danger)]">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="quiet" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {saving ? "Creating…" : `Top up ${formatKsc(Number(amount) || 0)}`}</Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm font-semibold text-[var(--steel)]">Pay <span className="font-black text-[var(--ink)]">R{Number(topUp.amountZar).toFixed(2)}</span> to receive <span className="font-black text-[var(--ink)]">{formatKsc(topUp.amountKsc)}</span>. Status: <span className="font-black">{topUp.status}</span></p>
          {topUp.paymentUrl ? <a href={topUp.paymentUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--signal)] px-6 text-sm font-black text-white">Pay on PayFast</a> : null}
          {error ? <p className="text-sm font-black text-[var(--danger)]">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="quiet" onClick={onClose}>Close</Button>
            <Button type="button" disabled={checking} onClick={() => void refreshStatus()}>{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />} I&apos;ve paid — refresh</Button>
          </div>
        </div>
      )}
    </Modal>
  );
}

function PaymentDialog({ open, wallet, onClose, onDone }: { open: boolean; wallet: KscWallet | null; onClose: () => void; onDone: (message: string) => void }) {
  const [amount, setAmount] = useState("250");
  const [description, setDescription] = useState("");
  const [agentId, setAgentId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [payment, setPayment] = useState<KscPayment | null>(null);
  const [acting, setActing] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }
    if (!canSpendKsc(wallet, value)) {
      setError(`Insufficient available KSC (have ${formatKsc(wallet?.availableBalance)}).`);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const created = await authorizeKscPayment({
        amountKsc: value,
        description: description.trim() || null,
        agentId: agentId.trim() || null,
      });
      setPayment(created);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  async function act(action: "capture" | "cancel" | "refund") {
    if (!payment) return;
    setActing(true);
    setError(null);
    try {
      const updated = action === "capture" ? await captureKscPayment(payment.id)
        : action === "cancel" ? await cancelKscPayment(payment.id)
        : await refundKscPayment(payment.id);
      setPayment(updated);
      if (updated.status !== "AUTHORIZED") {
        onDone(`Payment ${updated.status.toLowerCase()}: ${formatKsc(updated.amountKsc)}.`);
        setPayment(null);
        onClose();
      }
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setActing(false);
    }
  }

  return (
    <Modal open={open} title="Confirm KSC Payment" onClose={() => { setPayment(null); setError(null); onClose(); }}>
      {!payment ? (
        <form onSubmit={submit} className="grid gap-4">
          <label className={labelClass}>Amount (KSC)<input type="number" min={0.01} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Description · optional<input value={description} onChange={(e) => setDescription(e.target.value)} className={inputClass} maxLength={1000} placeholder="Summer Festival VIP ticket" /></label>
          <label className={labelClass}>Agent id · optional (needs a mandate)<input value={agentId} onChange={(e) => setAgentId(e.target.value)} className={inputClass} maxLength={120} placeholder="chatgpt-01" /></label>
          <p className="rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] p-3 text-xs font-bold text-[var(--steel)]">
            Authorizing moves {formatKsc(Number(amount) || 0)} from Available to Reserved. Capture finalizes it; cancel releases it. Remaining balance afterwards: {formatKsc((wallet?.availableBalance ?? 0) - (Number(amount) || 0))}.
          </p>
          {error ? <p className="text-sm font-black text-[var(--danger)]">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="quiet" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {saving ? "Authorizing…" : "Confirm Authorization"}</Button>
          </div>
        </form>
      ) : (
        <div className="grid gap-4">
          <p className="text-sm font-semibold text-[var(--steel)]">
            <span className="font-black text-[var(--ink)]">{formatKsc(payment.amountKsc)}</span> {payment.description ? `· ${payment.description}` : ""} — status <span className="font-black">{payment.status}</span>
          </p>
          {error ? <p className="text-sm font-black text-[var(--danger)]">{error}</p> : null}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="quiet" disabled={acting} onClick={() => void act("cancel")}>Cancel hold</Button>
            {payment.status === "AUTHORIZED" ? <Button type="button" disabled={acting} onClick={() => void act("capture")}>{acting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Capture</Button> : null}
            {payment.status === "CAPTURED" ? <Button type="button" disabled={acting} onClick={() => void act("refund")}>{acting ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Refund</Button> : null}
          </div>
        </div>
      )}
    </Modal>
  );
}

function MandateDialog({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (message: string) => void }) {
  const [agentId, setAgentId] = useState("");
  const [maxPerTx, setMaxPerTx] = useState("300");
  const [daily, setDaily] = useState("1000");
  const [monthly, setMonthly] = useState("5000");
  const [tools, setTools] = useState("ticket.purchase, product.purchase");
  const [merchants, setMerchants] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!agentId.trim()) {
      setError("Agent id is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createKscMandate({
        agentId: agentId.trim(),
        maxPerTransaction: Number(maxPerTx),
        dailyLimit: Number(daily),
        monthlyLimit: Number(monthly),
        allowedTools: tools.split(",").map((t) => t.trim()).filter(Boolean),
        allowedMerchants: merchants.split(",").map((t) => t.trim()).filter(Boolean),
      });
      onDone(`Mandate created for ${agentId.trim()}.`);
      onClose();
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} title="New Spending Mandate" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-4">
        <p className="text-sm font-semibold text-[var(--steel)]">The agent receives scoped payment authorization only — never bank credentials. Limits of 0 disable that cap.</p>
        <label className={labelClass}>Agent id<input required value={agentId} onChange={(e) => setAgentId(e.target.value)} className={inputClass} maxLength={120} placeholder="chatgpt-01" /></label>
        <div className="grid gap-4 sm:grid-cols-3">
          <label className={labelClass}>Max / tx<input required type="number" min={0.01} step="0.01" value={maxPerTx} onChange={(e) => setMaxPerTx(e.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Daily<input required type="number" min={0} step="0.01" value={daily} onChange={(e) => setDaily(e.target.value)} className={inputClass} /></label>
          <label className={labelClass}>Monthly<input required type="number" min={0} step="0.01" value={monthly} onChange={(e) => setMonthly(e.target.value)} className={inputClass} /></label>
        </div>
        <label className={labelClass}>Allowed tools · comma separated, empty = any<input value={tools} onChange={(e) => setTools(e.target.value)} className={inputClass} placeholder="ticket.purchase, product.purchase" /></label>
        <label className={labelClass}>Allowed merchants · comma separated, empty = any<input value={merchants} onChange={(e) => setMerchants(e.target.value)} className={inputClass} placeholder="tickets" /></label>
        {error ? <p className="text-sm font-black text-[var(--danger)]">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="quiet" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null} {saving ? "Creating…" : "Create mandate"}</Button>
        </div>
      </form>
    </Modal>
  );
}
