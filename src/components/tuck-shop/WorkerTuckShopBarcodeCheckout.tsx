"use client";

import { useState } from "react";
import { ExternalLink, Loader2, ScanLine, ShoppingCart } from "lucide-react";
import { createWorkerTuckShopBarcodePurchase } from "@/lib/api/tuck-shop";
import { normalizeApiError } from "@/lib/api/client";
import type { TuckShopPurchase } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

type BarcodeLine = {
  id: string;
  productId: string;
  barcode: string;
};

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

export function WorkerTuckShopBarcodeCheckout() {
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentContact, setPaymentContact] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [lines, setLines] = useState<BarcodeLine[]>([{ id: crypto.randomUUID(), productId: "", barcode: "" }]);
  const [purchase, setPurchase] = useState<TuckShopPurchase | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateLine(id: string, field: keyof Omit<BarcodeLine, "id">, value: string) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  }

  function addLine() {
    setLines((current) => [...current, { id: crypto.randomUUID(), productId: "", barcode: "" }]);
  }

  function removeLine(id: string) {
    setLines((current) => (current.length === 1 ? current : current.filter((line) => line.id !== id)));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setPurchase(null);

    const grouped = new Map<number, string[]>();
    for (const line of lines) {
      const productId = Number(line.productId);
      const barcode = line.barcode.trim();
      if (!productId || !barcode) {
        setSaving(false);
        setError("Every scanned line needs a product ID and barcode.");
        return;
      }
      grouped.set(productId, [...(grouped.get(productId) ?? []), barcode]);
    }

    try {
      const result = await createWorkerTuckShopBarcodePurchase({
        paymentEmail: paymentEmail || undefined,
        paymentContact: paymentContact || undefined,
        tipAmount: tipAmount ? Number(tipAmount) : undefined,
        tipCallbackUrl: typeof window === "undefined" ? undefined : window.location.href,
        items: Array.from(grouped.entries()).map(([productId, barcodes]) => ({
          productId,
          quantity: barcodes.length,
          barcodes,
        })),
      });
      setPurchase(result);
      setLines([{ id: crypto.randomUUID(), productId: "", barcode: "" }]);
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="border-[var(--signal)]/30 bg-white">
      <CardHeader>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Worker Tuck Shop barcode checkout</CardTitle>
            <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Scan or type product barcodes. The backend validates that the worker, product, barcode, and business match before creating the transaction.</p>
          </div>
          <StatusPill label="BARCODE CHECKOUT" tone="confirm" />
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-white p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}
        <form className="grid gap-4" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-3">
            <input value={paymentEmail} onChange={(event) => setPaymentEmail(event.target.value)} placeholder="Customer payment email" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={paymentContact} onChange={(event) => setPaymentContact(event.target.value)} placeholder="Customer WhatsApp/contact" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
            <input value={tipAmount} onChange={(event) => setTipAmount(event.target.value)} placeholder="Optional tip amount" inputMode="decimal" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
          </div>

          <div className="grid gap-3">
            {lines.map((line, index) => (
              <div key={line.id} className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-3 md:grid-cols-[8rem_1fr_auto] md:items-center">
                <input value={line.productId} onChange={(event) => updateLine(line.id, "productId", event.target.value)} placeholder="Product ID" inputMode="numeric" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)]" />
                <div className="relative">
                  <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--signal)]" />
                  <input value={line.barcode} onChange={(event) => updateLine(line.id, "barcode", event.target.value)} placeholder={`Barcode scan ${index + 1}`} className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
                </div>
                <Button type="button" variant="quiet" onClick={() => removeLine(line.id)}>Remove</Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="quiet" onClick={addLine}>Add barcode line</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} Create checkout</Button>
          </div>
        </form>

        {purchase ? (
          <div className="mt-5 rounded-[1.5rem] border border-[var(--confirm)]/30 bg-[var(--surface)] p-5">
            <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Transaction #{purchase.transactionId}</p>
            <p className="money mt-2 text-3xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
            <p className="mt-2 text-sm font-semibold text-[var(--steel)]">Payment status: {purchase.paymentStatus ?? "PENDING"}</p>
            {purchase.paymentUrl ? (
              <a href={purchase.paymentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black uppercase tracking-[0.08em] text-white hover:bg-[var(--ink)]">
                Open customer payment link <ExternalLink className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
