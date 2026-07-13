"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, Plus, ScanLine, ShoppingCart, Trash2, WandSparkles } from "lucide-react";
import { createWorkerTuckShopBarcodePurchase, type WorkerCheckoutPaymentType } from "@/lib/api/tuck-shop";
import { normalizeApiError } from "@/lib/api/client";
import type { TuckShopPurchase } from "@/lib/types/backend";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";

export type WorkerScannedProduct = {
  token: string;
  productId: number;
  productName: string;
  barcode: string;
  scannedValue: string;
  automaticBarcode?: boolean;
};

type BarcodeLine = {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: string;
  automaticBarcode: boolean;
};

type WorkerTuckShopBarcodeCheckoutProps = { scannedProduct?: WorkerScannedProduct | null };

function lineId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyLine(): BarcodeLine {
  return { id: lineId(), productId: "", productName: "", barcode: "", quantity: "1", automaticBarcode: false };
}

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function paymentLabel(paymentType: WorkerCheckoutPaymentType) {
  return paymentType === "CARD" ? "Card at the counter" : "Cash";
}

export function WorkerTuckShopBarcodeCheckout({ scannedProduct }: WorkerTuckShopBarcodeCheckoutProps) {
  const consumedScanTokenRef = useRef<string | null>(null);
  const [paymentType, setPaymentType] = useState<WorkerCheckoutPaymentType>("CASH");
  const [paymentContact, setPaymentContact] = useState("");
  const [lines, setLines] = useState<BarcodeLine[]>(() => [emptyLine()]);
  const [purchase, setPurchase] = useState<TuckShopPurchase | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scannedProduct || consumedScanTokenRef.current === scannedProduct.token) return;
    consumedScanTokenRef.current = scannedProduct.token;

    setLines((current) => {
      const matchingIndex = current.findIndex((line) => Number(line.productId) === scannedProduct.productId && line.automaticBarcode === Boolean(scannedProduct.automaticBarcode));
      if (matchingIndex >= 0) {
        return current.map((line, index) => index === matchingIndex ? { ...line, quantity: String(Math.max(Number(line.quantity || 1), 1) + 1) } : line);
      }

      const emptyIndex = current.findIndex((line) => !line.productId && !line.barcode);
      const scannedLine: BarcodeLine = {
        id: emptyIndex >= 0 ? current[emptyIndex].id : lineId(),
        productId: String(scannedProduct.productId),
        productName: scannedProduct.productName,
        barcode: scannedProduct.automaticBarcode ? "" : scannedProduct.barcode,
        quantity: "1",
        automaticBarcode: Boolean(scannedProduct.automaticBarcode),
      };
      if (emptyIndex >= 0) return current.map((line, index) => index === emptyIndex ? scannedLine : line);
      return [...current, scannedLine];
    });
  }, [scannedProduct]);

  function updateLine(id: string, field: keyof Omit<BarcodeLine, "id" | "automaticBarcode">, value: string) {
    setLines((current) => current.map((line) => line.id === id ? { ...line, [field]: value } : line));
  }

  function addLine() {
    setLines((current) => [...current, emptyLine()]);
  }

  function removeLine(id: string) {
    setLines((current) => current.length === 1 ? [emptyLine()] : current.filter((line) => line.id !== id));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setPurchase(null);

    const grouped = new Map<number, { quantity: number; barcodes: string[]; automaticBarcode: boolean }>();
    for (const line of lines) {
      const productId = Number(line.productId);
      const barcode = line.barcode.trim();
      const quantity = Number(line.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || (!line.automaticBarcode && !barcode)) {
        setSaving(false);
        setError("Every branded line needs a verified barcode. Auto-generated products only require the product ID.");
        return;
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        setSaving(false);
        setError("Every checkout quantity must be a whole number greater than zero.");
        return;
      }

      const existing = grouped.get(productId) ?? { quantity: 0, barcodes: [], automaticBarcode: line.automaticBarcode };
      existing.quantity += quantity;
      existing.automaticBarcode = existing.automaticBarcode || line.automaticBarcode;
      if (!line.automaticBarcode) existing.barcodes.push(...Array.from({ length: quantity }, () => barcode));
      grouped.set(productId, existing);
    }

    try {
      const result = await createWorkerTuckShopBarcodePurchase({
        paymentContact: paymentContact.trim() || undefined,
        paymentType: paymentType === "CARD" ? "SWIPE_MACHINE" : "CASH",
        items: Array.from(grouped.entries()).map(([productId, item]) => ({
          productId,
          quantity: item.quantity,
          barcodes: item.automaticBarcode ? [] : item.barcodes,
        })),
      });
      setPurchase(result);
      setLines([emptyLine()]);
      setPaymentContact("");
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
          <div><CardTitle>Worker Tuck Shop checkout</CardTitle><p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">Branded products require a scan. Auto-generated products fill secure stock-unit codes automatically. Workers complete only cash or card counter payments; users complete online payments from their own accounts.</p></div>
          <StatusPill label="COUNTER CHECKOUT" tone="confirm" />
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Payment type<select value={paymentType} onChange={(event) => setPaymentType(event.target.value as WorkerCheckoutPaymentType)} className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]"><option value="CASH">Cash</option><option value="CARD">Card</option></select></label>
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Customer contact · optional<input value={paymentContact} onChange={(event) => setPaymentContact(event.target.value)} placeholder="Email or cellphone" className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" /></label>
          </div>

          <div className="grid gap-3">
            {lines.map((line, index) => (
              <div key={line.id} className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-3 lg:grid-cols-[7rem_minmax(11rem,0.8fr)_minmax(14rem,1.4fr)_7rem_auto] lg:items-end">
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">Product ID<input value={line.productId} onChange={(event) => updateLine(line.id, "productId", event.target.value.replace(/\D/g, ""))} required placeholder="ID" inputMode="numeric" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)]" /></label>
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">Product<input value={line.productName} onChange={(event) => updateLine(line.id, "productName", event.target.value)} placeholder={`Product ${index + 1}`} className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" /></label>
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">{line.automaticBarcode ? "Automatic stock codes" : "Barcode scan"}<span className="relative block">{line.automaticBarcode ? <WandSparkles className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--confirm)]" /> : <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--signal)]" />}<input value={line.automaticBarcode ? "Created automatically at checkout" : line.barcode} onChange={(event) => updateLine(line.id, "barcode", event.target.value.replace(/\s/g, ""))} required={!line.automaticBarcode} disabled={line.automaticBarcode} placeholder="Product or stock-unit barcode" className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)] disabled:bg-[var(--confirm)]/8 disabled:text-[var(--confirm)]" /></span></label>
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">Quantity<input value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", event.target.value.replace(/\D/g, ""))} required min={1} inputMode="numeric" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)]" /></label>
                <Button type="button" variant="quiet" onClick={() => removeLine(line.id)} aria-label="Remove checkout line"><Trash2 className="h-4 w-4" /> Remove</Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between"><Button type="button" variant="quiet" onClick={addLine}><Plus className="h-4 w-4" /> Add product line</Button><Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} {saving ? "Creating checkout..." : `Create ${paymentLabel(paymentType)} checkout`}</Button></div>
        </form>

        {purchase ? <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/5 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Transaction #{purchase.transactionId}</p><p className="money mt-2 text-3xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p><p className="mt-2 text-sm font-semibold text-[var(--steel)]">{purchase.paymentType ?? paymentType} · {purchase.paymentStatus ?? "PAID"}</p></div><CreditCard className="h-12 w-12 text-[var(--confirm)]" /></div> : null}
      </CardContent>
    </Card>
  );
}
