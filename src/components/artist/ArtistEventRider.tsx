"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BadgePercent, CheckCircle2, Loader2, Minus, PackageCheck, Plus, ShoppingBag } from "lucide-react";
import { normalizeApiError } from "@/lib/api/client";
import { getArtistEvent, getArtistEventBookingStatus, getArtistEventRider, redeemArtistEventRider } from "@/lib/api/artist-events";
import { listTuckShopProducts } from "@/lib/api/tuck-shop";
import type { BackendArtistEvent, Product, RiderStatus } from "@/lib/types/backend";
import { productPrice } from "@/lib/tuck-shop/cart";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { formatZAR } from "@/services/artistService";

const BOOKED = new Set(["ACCEPTED", "CONFIRMED"]);

/**
 * Hospitality rider for a published event. Booked artists pick company
 * products up to the rider amount — no cart, no PayFast. The company pays,
 * stock drops at once, and the order lands straight in My Purchases for
 * counter collection.
 */
export function ArtistEventRider({ eventId }: { eventId: string }) {
  const [backendEvent, setBackendEvent] = useState<BackendArtistEvent | null>(null);
  const [rider, setRider] = useState<RiderStatus | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [liveEvent, liveRider] = await Promise.all([
        getArtistEvent(eventId).catch(() => null),
        getArtistEventRider(eventId).catch(() => null),
      ]);
      setBackendEvent(liveEvent);
      setRider(liveRider);
      if (liveEvent?.businessId != null) {
        try {
          const page = await listTuckShopProducts({ page: 0, size: 50, businessId: liveEvent.businessId });
          setProducts((page.content ?? []).filter((p) => p.stockQuantity > 0));
        } catch {
          setProducts([]);
        }
      }
      try {
        const booking = await getArtistEventBookingStatus(eventId);
        setBookingStatus(booking?.status ?? null);
      } catch {
        setBookingStatus(null);
      }
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <Card className="p-5">
        <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)]"><Loader2 className="h-4 w-4 animate-spin" /> Checking rider…</p>
      </Card>
    );
  }

  const riderAvailable = Boolean(backendEvent?.riderAvailable ?? rider?.riderAvailable);
  if (!riderAvailable) return null;

  const amount = Number(rider?.riderAmount ?? backendEvent?.riderAmount ?? 0);
  const spent = Number(rider?.spentAmount ?? 0);
  const remaining = Number(rider?.remainingAmount ?? Math.max(amount - spent, 0));
  const isBooked = bookingStatus != null && BOOKED.has(bookingStatus);
  const published = (backendEvent?.status ?? "").toUpperCase() === "PUBLISHED";

  function quantityFor(productId: number) {
    return Math.max(1, quantities[productId] ?? 1);
  }

  async function redeem(product: Product) {
    setRedeemingId(product.id);
    setError(null);
    setNotice(null);
    try {
      const result = await redeemArtistEventRider(eventId, { productId: product.id, quantity: quantityFor(product.id) });
      setNotice(`Added straight to My Purchases — ${result.quantity} × ${result.productName}, company-paid. Collect at the counter. ${formatZAR(Number(result.remainingAmount ?? 0))} rider balance left.`);
      const refreshed = await getArtistEventRider(eventId).catch(() => null);
      if (refreshed) setRider(refreshed);
      const page = backendEvent?.businessId != null
        ? await listTuckShopProducts({ page: 0, size: 50, businessId: backendEvent.businessId }).catch(() => null)
        : null;
      if (page) setProducts((page.content ?? []).filter((p) => p.stockQuantity > 0));
    } catch (exception) {
      setError(normalizeApiError(exception).message);
    } finally {
      setRedeemingId(null);
    }
  }

  return (
    <Card className="overflow-hidden border-[var(--gold)]/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BadgePercent className="h-5 w-5 text-[var(--signal)]" /> Hospitality Rider</CardTitle>
        <p className="mt-1 text-sm font-semibold text-[var(--steel)]">
          {formatZAR(amount)} rider · {formatZAR(spent)} taken · {formatZAR(remaining)} left
        </p>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? <p className="rounded-[1rem] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3 text-sm font-black text-[var(--danger)]">{error}</p> : null}
        {notice ? <p className="inline-flex items-start gap-2 rounded-[1rem] border border-[var(--confirm)]/30 bg-[var(--confirm)]/10 p-3 text-sm font-black text-[var(--confirm)]"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {notice}</p> : null}

        {!published ? (
          <p className="text-sm font-semibold text-[var(--steel)]">The rider unlocks once the host publishes this event.</p>
        ) : !isBooked ? (
          <p className="text-sm font-semibold text-[var(--steel)]">The rider is for confirmed booked artists. Request to perform — once accepted, pick company products here up to {formatZAR(amount)}.</p>
        ) : remaining <= 0 ? (
          <p className="text-sm font-black text-[var(--confirm)]">Rider fully redeemed — enjoy the show 🎤</p>
        ) : products.length === 0 ? (
          <p className="text-sm font-semibold text-[var(--steel)]">No company products available right now.</p>
        ) : (
          <div className="grid gap-3">
            {products.slice(0, 12).map((product) => {
              const qty = quantityFor(product.id);
              const lineTotal = productPrice(product) * qty;
              const exceeds = lineTotal > remaining;
              return (
                <div key={product.id} className="grid gap-2 rounded-[1rem] border border-[var(--line)] bg-white p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{product.name}</p>
                      <p className="text-xs font-bold text-[var(--steel)]">{formatZAR(productPrice(product))} each · {product.stockQuantity} in stock</p>
                    </div>
                    <div className="inline-flex shrink-0 items-center gap-2">
                      <button type="button" aria-label="Decrease quantity" onClick={() => setQuantities((c) => ({ ...c, [product.id]: Math.max(1, qty - 1) }))} className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)]"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-6 text-center text-sm font-black">{qty}</span>
                      <button type="button" aria-label="Increase quantity" onClick={() => setQuantities((c) => ({ ...c, [product.id]: qty + 1 }))} className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)]"><Plus className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <Button type="button" disabled={redeemingId === product.id || exceeds} onClick={() => void redeem(product)}>
                    {redeemingId === product.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
                    {exceeds ? `Exceeds ${formatZAR(remaining)} balance` : `Take ${qty} · ${formatZAR(lineTotal)} off rider`}
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        {(rider?.items ?? []).length > 0 ? (
          <div className="grid gap-2 border-t border-[var(--line)] pt-3">
            <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Already taken</p>
            {rider!.items.slice(0, 6).map((item) => (
              <p key={item.id} className="flex items-center gap-2 text-xs font-bold text-[var(--steel)]"><PackageCheck className="h-3.5 w-3.5 text-[var(--signal)]" /> {item.quantity} × {item.productName} · {formatZAR(Number(item.totalAmount ?? 0))}{item.transactionId ? ` · order #${item.transactionId}` : ""}</p>
            ))}
          </div>
        ) : null}

        <Link href="/dashboard/artist/mall" className="text-center text-xs font-black text-[var(--signal)] hover:text-[var(--signal-strong)]">Rider orders land straight in My Purchases →</Link>
      </CardContent>
    </Card>
  );
}
