"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { CreditCard, ExternalLink, Loader2, Plus, ScanLine, ShoppingCart, Trash2, UserRound } from "lucide-react";
import {
  createWorkerTuckShopBarcodePurchase,
  type WorkerCheckoutPaymentType,
} from "@/lib/api/tuck-shop";
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
};

type BarcodeLine = {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: string;
};

type WorkerTuckShopBarcodeCheckoutProps = {
  scannedProduct?: WorkerScannedProduct | null;
};

function lineId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyLine(): BarcodeLine {
  return { id: lineId(), productId: "", productName: "", barcode: "", quantity: "1" };
}

function money(value?: number | null) {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(Number(value ?? 0));
}

function paymentLabel(paymentType: WorkerCheckoutPaymentType) {
  if (paymentType === "CARD") return "Card at the counter";
  if (paymentType === "KING_SPARKON") return "Through King Sparkon";
  return "Cash";
}

export function WorkerTuckShopBarcodeCheckout({ scannedProduct }: WorkerTuckShopBarcodeCheckoutProps) {
  const consumedScanTokenRef = useRef<string | null>(null);
  const [paymentType, setPaymentType] = useState<WorkerCheckoutPaymentType>("CASH");
  const [customerUsername, setCustomerUsername] = useState("");
  const [paymentContact, setPaymentContact] = useState("");
  const [tipAmount, setTipAmount] = useState("");
  const [lines, setLines] = useState<BarcodeLine[]>(() => [emptyLine()]);
  const [purchase, setPurchase] = useState<TuckShopPurchase | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!scannedProduct || consumedScanTokenRef.current === scannedProduct.token) return;
    consumedScanTokenRef.current = scannedProduct.token;

    setLines((current) => {
      const matchingIndex = current.findIndex(
        (line) => Number(line.productId) === scannedProduct.productId && line.barcode === scannedProduct.barcode,
      );
      if (matchingIndex >= 0) {
        return current.map((line, index) => index === matchingIndex
          ? { ...line, quantity: String(Math.max(Number(line.quantity || 1), 1) + 1) }
          : line);
      }

      const emptyIndex = current.findIndex((line) => !line.productId && !line.barcode);
      const scannedLine: BarcodeLine = {
        id: emptyIndex >= 0 ? current[emptyIndex].id : lineId(),
        productId: String(scannedProduct.productId),
        productName: scannedProduct.productName,
        barcode: scannedProduct.barcode,
        quantity: "1",
      };

      if (emptyIndex >= 0) {
        return current.map((line, index) => index === emptyIndex ? scannedLine : line);
      }
      return [...current, scannedLine];
    });
  }, [scannedProduct]);

  function updateLine(id: string, field: keyof Omit<BarcodeLine, "id">, value: string) {
    setLines((current) => current.map((line) => (line.id === id ? { ...line, [field]: value } : line)));
  }

  function addLine() {
    setLines((current) => [...current, emptyLine()]);
  }

  function removeLine(id: string) {
    setLines((current) => (current.length === 1 ? [emptyLine()] : current.filter((line) => line.id !== id)));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setPurchase(null);

    if (paymentType === "KING_SPARKON" && !customerUsername.trim()) {
      setSaving(false);
      setError("Enter the registered customer username before sending a King Sparkon checkout.");
      return;
    }

    const grouped = new Map<number, { quantity: number; barcodes: string[] }>();
    for (const line of lines) {
      const productId = Number(line.productId);
      const barcode = line.barcode.trim();
      const quantity = Number(line.quantity);
      if (!Number.isInteger(productId) || productId <= 0 || !barcode) {
        setSaving(false);
        setError("Every checkout line needs a verified product ID and barcode.");
        return;
      }
      if (!Number.isInteger(quantity) || quantity <= 0) {
        setSaving(false);
        setError("Every checkout quantity must be a whole number greater than zero.");
        return;
      }

      const existing = grouped.get(productId) ?? { quantity: 0, barcodes: [] };
      existing.quantity += quantity;
      existing.barcodes.push(...Array.from({ length: quantity }, () => barcode));
      grouped.set(productId, existing);
    }

    const backendPaymentType = paymentType === "CARD"
      ? "SWIPE_MACHINE"
      : paymentType === "KING_SPARKON"
        ? "WEBSITE_PAYMENT"
        : "CASH";

    try {
      const result = await createWorkerTuckShopBarcodePurchase({
        paymentContact: paymentContact.trim() || undefined,
        tipAmount: tipAmount ? Number(tipAmount) : undefined,
        tipCallbackUrl: typeof window === "undefined" ? undefined : window.location.href,
        paymentType: backendPaymentType,
        customerUsername: paymentType === "KING_SPARKON" ? customerUsername.trim() : undefined,
        items: Array.from(grouped.entries()).map(([productId, item]) => ({
          productId,
          quantity: item.quantity,
          barcodes: item.barcodes,
        })),
      });
      setPurchase(result);
      setLines([emptyLine()]);
      if (paymentType !== "KING_SPARKON") setCustomerUsername("");
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
            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--steel)]">
              A verified camera or manual scan fills the product ID and barcode. Set the quantity and payment method, then create the worker transaction.
            </p>
          </div>
          <StatusPill label="BARCODE CHECKOUT" tone="confirm" />
        </div>
      </CardHeader>
      <CardContent>
        {error ? <p className="mb-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p> : null}

        <form className="grid gap-5" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
              Payment type
              <select value={paymentType} onChange={(event) => setPaymentType(event.target.value as WorkerCheckoutPaymentType)} className="min-h-11 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]">
                <option value="CASH">Cash</option>
                <option value="CARD">Card</option>
                <option value="KING_SPARKON">Through King Sparkon</option>
              </select>
            </label>

            <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
              Customer username {paymentType === "KING_SPARKON" ? "· required" : "· optional"}
              <span className="relative block">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--signal)]" />
                <input value={customerUsername} onChange={(event) => setCustomerUsername(event.target.value)} required={paymentType === "KING_SPARKON"} placeholder="Registered username" className="min-h-11 w-full rounded-full border border-[var(--line)] bg-[var(--surface)] pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
              </span>
            </label>

            <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
              Contact or tip
              <div className="grid grid-cols-2 gap-2">
                <input value={paymentContact} onChange={(event) => setPaymentContact(event.target.value)} placeholder="Contact" className="min-h-11 min-w-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
                <input value={tipAmount} onChange={(event) => setTipAmount(event.target.value)} placeholder="Tip R" inputMode="decimal" className="min-h-11 min-w-0 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
              </div>
            </label>
          </div>

          {paymentType === "KING_SPARKON" ? (
            <p className="rounded-[1rem] border border-[var(--gold)]/40 bg-[var(--gold)]/12 p-3 text-sm font-bold text-[var(--ink)]">
              King Sparkon sends the checkout to the registered username. The transaction remains pending until the customer completes the payment.
            </p>
          ) : null}

          <div className="grid gap-3">
            {lines.map((line, index) => (
              <div key={line.id} className="grid gap-3 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-3 lg:grid-cols-[7rem_minmax(11rem,0.8fr)_minmax(14rem,1.4fr)_7rem_auto] lg:items-end">
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">
                  Product ID
                  <input value={line.productId} onChange={(event) => updateLine(line.id, "productId", event.target.value.replace(/\D/g, ""))} required placeholder="ID" inputMode="numeric" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)]" />
                </label>
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">
                  Product
                  <input value={line.productName} onChange={(event) => updateLine(line.id, "productName", event.target.value)} placeholder={`Product ${index + 1}`} className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
                </label>
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">
                  Barcode scan
                  <span className="relative block">
                    <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--signal)]" />
                    <input value={line.barcode} onChange={(event) => updateLine(line.id, "barcode", event.target.value.replace(/\s/g, ""))} required placeholder="Product or stock-unit barcode" className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[var(--signal)]" />
                  </span>
                </label>
                <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">
                  Quantity
                  <input value={line.quantity} onChange={(event) => updateLine(line.id, "quantity", event.target.value.replace(/\D/g, ""))} required min={1} inputMode="numeric" className="min-h-11 rounded-full border border-[var(--line)] bg-white px-4 text-sm font-black outline-none focus:border-[var(--signal)]" />
                </label>
                <Button type="button" variant="quiet" onClick={() => removeLine(line.id)} aria-label="Remove checkout line"><Trash2 className="h-4 w-4" /> Remove</Button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button type="button" variant="quiet" onClick={addLine}><Plus className="h-4 w-4" /> Add product line</Button>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} {saving ? "Creating checkout..." : `Create ${paymentLabel(paymentType)} checkout`}</Button>
          </div>
        </form>

        {purchase ? (
          <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/5 p-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Transaction #{purchase.transactionId}</p>
              <p className="money mt-2 text-3xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p>
              <p className="mt-2 text-sm font-semibold text-[var(--steel)]">{purchase.paymentType ?? paymentType} · {purchase.paymentStatus ?? "CREATED"}</p>
              {paymentType === "KING_SPARKON" ? <p className="mt-2 text-sm font-black text-[var(--confirm)]">Checkout sent to {customerUsername || "the registered customer"}.</p> : null}
              {purchase.paymentUrl ? (
                <a href={purchase.paymentUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-5 text-sm font-black text-white hover:bg-[var(--ink)]">
                  Open King Sparkon checkout <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
            {purchase.paymentQrCodeUrl ? <img src={purchase.paymentQrCodeUrl} alt="King Sparkon payment QR" className="h-40 w-40 rounded-[1.2rem] border border-[var(--line)] bg-white p-2" /> : <CreditCard className="h-12 w-12 text-[var(--confirm)]" />}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
