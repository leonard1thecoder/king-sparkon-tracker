"use client";

import { type FormEvent, useMemo, useState } from "react";
import { CheckCircle2, CreditCard, Loader2, LockKeyhole, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { createTip } from "@/lib/api/tips";
import { normalizeApiError } from "@/lib/api/client";

const tipOptions = [
  { id: "20", label: "R20", amount: 20, title: "Quick thanks", detail: "A small thank-you for fast service." },
  { id: "50", label: "R50", amount: 50, title: "Great support", detail: "Reward helpful service and good attitude." },
  { id: "100", label: "R100", amount: 100, title: "Excellent work", detail: "For workers who went above expectation." },
  { id: "custom", label: "Custom", amount: null, title: "Own amount", detail: "Enter the exact tip value you want to give." },
] as const;

type TipOptionId = (typeof tipOptions)[number]["id"];

function numericWorkerId(value: string) {
  const direct = Number(value);
  if (Number.isSafeInteger(direct) && direct > 0) return direct;

  const match = value.match(/\d+/);
  if (!match) return null;

  const parsed = Number(match[0]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function validExpiry(value: string) {
  const match = value.match(/^(0[1-9]|1[0-2])\/(\d{2})$/);
  if (!match) return false;

  const expiryMonth = Number(match[1]);
  const expiryYear = 2000 + Number(match[2]);
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  return expiryYear > currentYear || (expiryYear === currentYear && expiryMonth >= currentMonth);
}

export function WorkerTipCheckout({ workerId }: { workerId: string }) {
  const [selectedOption, setSelectedOption] = useState<TipOptionId | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const selectedAmount = useMemo(() => {
    const option = tipOptions.find((item) => item.id === selectedOption);
    if (!option) return 0;
    if (option.amount !== null) return option.amount;
    return Number(customAmount);
  }, [customAmount, selectedOption]);

  function chooseOption(id: TipOptionId) {
    setSelectedOption(id);
    setNotice(null);
    setSuccess(null);
    if (id !== "custom") setCustomAmount("");
  }

  async function submitTip(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(null);
    setSuccess(null);

    if (!selectedOption) {
      setNotice("Choose a tip amount first.");
      return;
    }

    if (!Number.isFinite(selectedAmount) || selectedAmount < 1) {
      setNotice("Enter a custom tip amount of at least R1.");
      return;
    }

    const cardDigits = cardNumber.replace(/\D/g, "");
    if (cardDigits.length < 13 || cardDigits.length > 19) {
      setNotice("Enter a valid card number.");
      return;
    }

    if (!validExpiry(expiry)) {
      setNotice("Enter a valid future expiry date using MM/YY.");
      return;
    }

    if (!/^\d{3,4}$/.test(cvc)) {
      setNotice("Enter a valid 3 or 4 digit CVC.");
      return;
    }

    const backendWorkerId = numericWorkerId(workerId);
    if (!backendWorkerId) {
      setNotice("This worker QR does not contain the numeric worker ID required by the payment backend.");
      return;
    }

    setSubmitting(true);

    try {
      const tip = await createTip({
        workerId: backendWorkerId,
        tipAmount: selectedAmount,
        callbackUrl: typeof window === "undefined" ? "/dashboard/user/tips/scan" : window.location.href,
      });

      if (tip.paymentUrl && typeof window !== "undefined") {
        window.location.assign(tip.paymentUrl);
        return;
      }

      setSuccess(`Your ${new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(selectedAmount)} tip for worker ${workerId} was created.`);
      setCardNumber("");
      setExpiry("");
      setCvc("");
    } catch (error) {
      setNotice(normalizeApiError(error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Choose a tip amount</CardTitle>
          <p className="mt-2 text-sm leading-6 text-[var(--steel)]">
            Select an amount to reveal the secure card payment form for worker {workerId}.
          </p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-[1.2rem] bg-[var(--ink)] text-[var(--gold)]">
          <WalletCards className="h-6 w-6" />
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={submitTip} className="grid gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {tipOptions.map((option) => {
              const active = selectedOption === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => chooseOption(option.id)}
                  aria-pressed={active}
                  className={`group rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5 hover:border-[var(--gold)] ${
                    active
                      ? "border-[var(--ink)] bg-[var(--ink)] text-white shadow-[var(--shadow-ledger)]"
                      : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className={`money text-2xl font-black ${active ? "text-[var(--gold)]" : "text-[var(--ink)]"}`}>{option.label}</p>
                      <h3 className="mt-2 font-black tracking-[-0.02em]">{option.title}</h3>
                    </div>
                    <span className={`grid h-7 w-7 place-items-center rounded-full border ${active ? "border-white/20 bg-white/10 text-[var(--gold)]" : "border-[var(--line)] bg-white text-[var(--signal)]"}`}>
                      {active ? <CheckCircle2 className="h-4 w-4" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                    </span>
                  </div>
                  <p className={`mt-3 text-sm leading-6 ${active ? "text-white/65" : "text-[var(--steel)]"}`}>{option.detail}</p>
                </button>
              );
            })}
          </div>

          {selectedOption === "custom" ? (
            <label className="grid gap-2 rounded-[1.35rem] border border-[var(--gold)]/55 bg-[var(--gold)]/10 p-4 text-sm font-black text-[var(--ink)]">
              Own tip amount
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-black text-[var(--signal)]">R</span>
                <input
                  value={customAmount}
                  onChange={(event) => setCustomAmount(event.target.value)}
                  type="number"
                  min="1"
                  step="1"
                  inputMode="decimal"
                  required
                  autoFocus
                  placeholder="Enter amount"
                  className="h-12 w-full rounded-full border border-[var(--line)] bg-white pl-9 pr-4 text-base font-black outline-none focus:border-[var(--signal)]"
                />
              </div>
            </label>
          ) : null}

          {selectedOption ? (
            <section className="grid gap-4 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-[0.9rem] bg-[var(--ink)] text-[var(--gold)]">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-black text-[var(--ink)]">Card payment details</h3>
                  <p className="mt-1 text-xs text-[var(--steel)]">Card values stay in this form and are never included in the King Sparkon tip API request.</p>
                </div>
              </div>

              <label className="grid gap-2 text-sm font-bold text-[var(--steel)]">
                Card number
                <input
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value.replace(/[^\d ]/g, "").slice(0, 23))}
                  name="cardNumber"
                  autoComplete="cc-number"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  required
                  className="h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 font-mono text-base font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2 text-sm font-bold text-[var(--steel)]">
                  Expiry date
                  <input
                    value={expiry}
                    onChange={(event) => setExpiry(event.target.value.replace(/[^\d/]/g, "").slice(0, 5))}
                    name="expiry"
                    autoComplete="cc-exp"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    required
                    className="h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 font-mono text-base font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]"
                  />
                </label>

                <label className="grid gap-2 text-sm font-bold text-[var(--steel)]">
                  CVC
                  <input
                    value={cvc}
                    onChange={(event) => setCvc(event.target.value.replace(/\D/g, "").slice(0, 4))}
                    name="cvc"
                    autoComplete="cc-csc"
                    inputMode="numeric"
                    placeholder="123"
                    required
                    className="h-12 rounded-[1rem] border border-[var(--line)] bg-[var(--surface)] px-4 font-mono text-base font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]"
                  />
                </label>
              </div>

              <div className="flex items-start gap-2 rounded-[1rem] bg-[var(--surface)] p-3 text-xs font-semibold leading-5 text-[var(--steel)]">
                <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[var(--confirm)]" />
                The backend receives only the worker ID and tip amount. A configured payment provider completes the secure card charge.
              </div>

              {notice ? <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-3 text-sm font-bold text-[var(--danger)]">{notice}</p> : null}
              {success ? <p className="rounded-[1rem] border border-[var(--confirm)]/25 bg-[var(--confirm)]/10 p-3 text-sm font-bold text-[var(--confirm)]">{success}</p> : null}

              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {submitting ? "Creating tip..." : "Tip worker"}
              </Button>
            </section>
          ) : (
            <p className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-[var(--surface)] p-5 text-center text-sm font-semibold text-[var(--steel)]">
              Select R20, R50, R100, or Custom to show the payment form.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
