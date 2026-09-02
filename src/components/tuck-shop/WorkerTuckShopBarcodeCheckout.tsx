"use client";

import { type FormEvent, useEffect, useRef, useState } from "react";
import { CreditCard, Loader2, Plus, ScanLine, ShoppingCart, Trash2 } from "lucide-react";
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
  unitPrice?: number;
};

type BarcodeLine = {
  id: string;
  productId: string;
  productName: string;
  barcode: string;
  quantity: string;
  automaticBarcode: boolean;
  unitPrice: string;
};

type WorkerTuckShopBarcodeCheckoutProps = { scannedProduct?: WorkerScannedProduct | null };

function lineId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function emptyLine(): BarcodeLine {
  return { id: lineId(), productId: "", productName: "", barcode: "", quantity: "1", automaticBarcode: false, unitPrice: "" };
}

function rowTotal(line: BarcodeLine): number {
  const qty = Number(line.quantity);
  const price = Number(line.unitPrice);
  if (!Number.isFinite(qty) || !Number.isFinite(price)) return 0;
  return qty * price;
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
  const [lines, setLines] = useState<BarcodeLine[]>(() => [emptyLine()]);
  const [purchase, setPurchase] = useState<TuckShopPurchase | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pendingHydratedRef = useRef(false);

  // Hydrate pending lines from worker products Sell product flow (quantity, barcode, Product, productId)
  useEffect(() => {
    if (pendingHydratedRef.current) return;
    pendingHydratedRef.current = true;
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem("workerPendingCheckoutLines");
      if (!raw) return;
      const pending: Array<{ productId: number; productName: string; barcode: string; quantity: number; automaticBarcode: boolean; unitPrice?: number }> = JSON.parse(raw);
      if (!Array.isArray(pending) || pending.length === 0) return;
      setLines(() =>
        pending.map((p) => ({
          id: lineId(),
          productId: String(p.productId),
          productName: p.productName,
          barcode: p.automaticBarcode ? "" : p.barcode,
          quantity: String(p.quantity),
          automaticBarcode: Boolean(p.automaticBarcode),
          unitPrice: p.unitPrice != null ? String(p.unitPrice) : "",
        })),
      );
      // Fill missing unitPrice for old pending lines
      pending.forEach((p) => {
        if (p.unitPrice == null) {
          void import("@/lib/api/tuck-shop").then(({ getWorkerProductById }) =>
            getWorkerProductById(p.productId)
              .then((product) => {
                const price = String(Number(product.salePrice ?? product.price ?? 0));
                setLines((cur) => cur.map((l) => (l.productId === String(p.productId) && !l.unitPrice ? { ...l, unitPrice: price } : l)));
              })
              .catch(() => {}),
          );
        }
      });
    } catch {}
  }, []);

  useEffect(() => {
    if (!scannedProduct || consumedScanTokenRef.current === scannedProduct.token) return;
    consumedScanTokenRef.current = scannedProduct.token;

    // If lines were hydrated from pending, scannedProduct may duplicate; merge intelligently
    setLines((current) => {
      // If current is single empty line, replace it
      const isSingleEmpty = current.length === 1 && !current[0].productId && !current[0].barcode;
      if (isSingleEmpty) {
        return [
          {
            id: current[0].id,
            productId: String(scannedProduct.productId),
            productName: scannedProduct.productName,
            barcode: scannedProduct.automaticBarcode ? "" : scannedProduct.barcode,
            quantity: "1",
            automaticBarcode: Boolean(scannedProduct.automaticBarcode),
            unitPrice: scannedProduct.unitPrice != null ? String(scannedProduct.unitPrice) : "",
          },
        ];
      }
      const matchingIndex = current.findIndex((line) => Number(line.productId) === scannedProduct.productId && line.automaticBarcode === Boolean(scannedProduct.automaticBarcode) && line.barcode === (scannedProduct.automaticBarcode ? "" : scannedProduct.barcode));
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
        unitPrice: scannedProduct.unitPrice != null ? String(scannedProduct.unitPrice) : "",
      };
      if (emptyIndex >= 0) return current.map((line, index) => index === emptyIndex ? scannedLine : line);
      return [...current, scannedLine];
    });
  }, [scannedProduct]);

  function updateLine(id: string, field: keyof Omit<BarcodeLine, "id" | "automaticBarcode">, value: string) {
    setLines((current) => current.map((line) => line.id === id ? { ...line, [field]: value } : line));
    if (field === "productId") {
      const pid = Number(value.replace(/\D/g, ""));
      if (Number.isInteger(pid) && pid > 0) {
        void import("@/lib/api/tuck-shop").then(({ getWorkerProductById }) =>
          getWorkerProductById(pid)
            .then((product) => {
              const price = Number(product.salePrice ?? product.price ?? 0);
              const barcode = product.productBarcode?.trim() || "";
              setLines((cur) =>
                cur.map((l) =>
                  l.id === id
                    ? { ...l, productName: l.productName || product.name, unitPrice: String(price), barcode: l.barcode || barcode, automaticBarcode: !product.productBarcode }
                    : l,
                ),
              );
            })
            .catch(() => {}),
        );
      }
    }
  }

  const totalPrice = lines.reduce((sum, line) => sum + rowTotal(line), 0);

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
        paymentContact: undefined,
        paymentType: paymentType === "CARD" ? "SWIPE_MACHINE" : "CASH",
        items: Array.from(grouped.entries()).map(([productId, item]) => ({
          productId,
          quantity: item.quantity,
          barcodes: item.automaticBarcode ? [] : item.barcodes,
        })),
      });
      setPurchase(result);
      setLines([emptyLine()]);
      if (typeof window !== "undefined") {
        try {
          localStorage.removeItem("workerPendingCheckoutLines");
        } catch {}
      }
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
          <div className="grid gap-3 md:grid-cols-1">
            <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Payment type<select value={paymentType} onChange={(event) => setPaymentType(event.target.value as WorkerCheckoutPaymentType)} className="min-h-11 rounded-[var(--radius-md)] border border-[var(--line)] bg-[var(--surface)] px-4 text-sm font-black text-[var(--ink)] outline-none focus:border-[var(--signal)]"><option value="CASH">Cash</option><option value="CARD">Card</option></select></label>
          </div>

          <div className="grid gap-4">
            {lines.map((line, index) => {
              const rt = rowTotal(line);
              return (
                <div
                  key={line.id}
                  className="grid gap-4 rounded-[var(--radius-lg)] border border-[var(--line)] bg-[var(--surface)] p-4 lg:grid-cols-[minmax(220px,2fr)_minmax(140px,1.3fr)_minmax(100px,1fr)_auto] lg:items-end lg:gap-6"
                >
                  {/* 1. PRODUCT — largest, keeps name inside rounded bordered field */}
                  <div className="grid gap-2">
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">Product</span>
                    <input
                      value={line.productName}
                      onChange={(event) => updateLine(line.id, "productName", event.target.value)}
                      placeholder={`Product ${index + 1}`}
                      className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]"
                    />
                    {!line.automaticBarcode ? (
                      <span className="relative block">
                        <ScanLine className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--signal)]" />
                        <input
                          value={line.barcode}
                          onChange={(event) => updateLine(line.id, "barcode", event.target.value.replace(/\s/g, ""))}
                          required
                          placeholder="Product or stock-unit barcode"
                          className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-white pl-10 pr-4 text-sm font-semibold text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]"
                        />
                      </span>
                    ) : null}
                  </div>

                  {/* 2. ROW TOTAL — own section, price field + calculation vertically aligned */}
                  <div className="grid gap-1.5">
                    <span className="text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">Row total</span>
                    <div className="flex min-h-11 items-center rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-sm font-black text-[var(--ink)]">{money(rt)}</div>
                    <span className="min-h-[0.9rem] text-left text-[0.65rem] font-bold leading-none text-[var(--muted)]">{line.unitPrice ? `${money(Number(line.unitPrice))} × ${line.quantity}` : "\u00A0"}</span>
                  </div>

                  {/* 3. QUANTITY — own section, aligned with row total field */}
                  <label className="grid gap-1.5 text-[0.65rem] font-black uppercase tracking-[0.08em] text-[var(--steel)]">
                    Quantity
                    <input
                      value={line.quantity}
                      onChange={(event) => updateLine(line.id, "quantity", event.target.value.replace(/\D/g, ""))}
                      required
                      min={1}
                      inputMode="numeric"
                      className="min-h-11 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-white px-4 text-center text-sm font-black text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]"
                    />
                  </label>

                  {/* 4. REMOVE — own small column, vertically aligned with quantity field */}
                  <div className="grid gap-1.5 lg:self-end">
                    <span className="hidden text-[0.65rem] font-black uppercase tracking-[0.08em] text-transparent lg:block" aria-hidden>
                      Action
                    </span>
                    <Button type="button" variant="quiet" onClick={() => removeLine(line.id)} aria-label="Remove checkout line" className="min-h-11 w-full lg:w-auto">
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button type="button" variant="quiet" onClick={addLine}><Plus className="h-4 w-4" /> Add product line</Button>
              <div className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-black text-[var(--ink)]">Total: <span className="money text-[var(--signal)]">{money(totalPrice)}</span> <span className="ml-1 text-xs font-bold text-[var(--muted)]">to tell customer</span></div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />} {saving ? "Creating checkout..." : `Create ${paymentLabel(paymentType)} checkout`}</Button>
          </div>
        </form>

        {purchase ? <div className="mt-5 grid gap-4 rounded-[1.5rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/5 p-5 md:grid-cols-[1fr_auto] md:items-center"><div><p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Transaction #{purchase.transactionId}</p><p className="money mt-2 text-3xl font-black text-[var(--ink)]">{money(purchase.productTotal)}</p><p className="mt-2 text-sm font-semibold text-[var(--steel)]">{purchase.paymentType ?? paymentType} · {purchase.paymentStatus ?? "PAID"}</p></div><CreditCard className="h-12 w-12 text-[var(--confirm)]" /></div> : null}
      </CardContent>
    </Card>
  );
}
