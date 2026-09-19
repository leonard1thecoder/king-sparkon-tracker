"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, CreditCard, Loader2, ShieldCheck } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import { submitPayFastForm, validatePayFastForm, type PayFastFields } from "@/lib/payfast";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { PayFastFormResponse } from "@/lib/types/backend";

export default function PayPage() {
  const params = useParams<{ merchantPaymentId: string }>();
  const merchantPaymentId = params.merchantPaymentId;
  const [form, setForm] = useState<PayFastFormResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadForm() {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/payments/payfast/form/${encodeURIComponent(merchantPaymentId)}`, {
          cache: "no-store",
        });
        const body = (await response.json().catch(() => ({}))) as Partial<PayFastFormResponse> & { message?: string };
        if (!response.ok) {
          throw new Error(body.message || "This payment link is no longer valid.");
        }
        if (!active) return;
        setForm(body as PayFastFormResponse);
      } catch (exception) {
        if (!active) return;
        setError(normalizeApiError(exception).message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadForm();
    return () => {
      active = false;
    };
  }, [merchantPaymentId]);

  function payNow() {
    if (!form) return;
    setPaying(true);
    setError(null);
    try {
      submitPayFastForm(form.processUrl, form.fields as PayFastFields);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
      setPaying(false);
    }
  }

  const validationProblem = form ? validatePayFastForm(form.processUrl, form.fields as PayFastFields) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-5 py-10">
      <Card className="w-full max-w-md overflow-hidden">
        <CardHeader className="flex flex-col gap-2">
          <p className="font-mono text-[0.65rem] font-black uppercase tracking-[0.16em] text-[var(--signal)]">
            King Sparkon
          </p>
          <CardTitle>Complete your payment</CardTitle>
          <p className="text-sm leading-6 text-[var(--steel)]">
            Payment <span className="font-mono font-black text-[var(--ink)]">{merchantPaymentId}</span> is ready on
            PayFast&apos;s secure page.
          </p>
        </CardHeader>
        <CardContent className="grid gap-4">
          {loading ? (
            <p className="flex items-center justify-center gap-2 py-6 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin text-[var(--signal)]" /> Loading secure payment...
            </p>
          ) : null}

          {error ? (
            <p className="rounded-[1rem] border border-[var(--danger)]/25 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">
              {error}
            </p>
          ) : null}

          {!loading && !error && form ? (
            <>
              <div className="flex items-center justify-between gap-3 rounded-[1.25rem] bg-[var(--ink)] p-4 text-white">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-white/55">Amount due</span>
                <span className="money text-2xl font-black text-[var(--gold)]">
                  {new Intl.NumberFormat("en-ZA", { style: "currency", currency: form.currency || "ZAR" }).format(
                    Number(form.amount ?? 0),
                  )}
                </span>
              </div>

              {validationProblem ? (
                <p className="flex items-start gap-2 rounded-[1rem] border border-[var(--gold)]/45 bg-[var(--gold)]/10 p-3 text-xs font-semibold leading-5 text-[var(--steel)]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" /> {validationProblem}
                </p>
              ) : null}

              <Button onClick={payNow} disabled={paying || Boolean(validationProblem)} className="w-full">
                {paying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {paying ? "Opening PayFast..." : "Pay with PayFast"}
              </Button>

              <p className="flex items-start gap-2 rounded-[1rem] bg-[var(--surface)] p-3 text-xs font-semibold leading-5 text-[var(--steel)]">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--confirm)]" />
                You pay on PayFast. King Sparkon only marks the order paid after PayFast confirms it.
              </p>
            </>
          ) : null}

          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:border-[var(--gold)]"
          >
            Back to home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
