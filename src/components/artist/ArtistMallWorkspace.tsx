"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Loader2, PackageCheck, ShoppingBag } from "lucide-react";
import { TuckShopDashboard } from "@/components/tuck-shop/TuckShopDashboard";
import { Card } from "@/components/ui/Card";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { listArtistMallPurchases } from "@/lib/api/artist-dashboard";
import { normalizeApiError } from "@/lib/api/client";
import type { TuckShopPurchase } from "@/lib/types/backend";

export function ArtistMallWorkspace() {
  const [purchases, setPurchases] = useState<TuckShopPurchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listArtistMallPurchases()
      .then((items) => {
        if (!cancelled) setPurchases(Array.isArray(items) ? items : []);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid gap-8 p-5 md:p-8 pb-10">
      <section className="grid gap-4">
        <SectionHeader
          title="My mall purchases"
          description={loading ? "Loading your purchases…" : purchases.length > 0 ? `${purchases.length} purchase${purchases.length === 1 ? "" : "s"} on this artist account` : "Your artist mall checkouts will appear here"}
          eyebrow="MY PURCHASES"
        />
        {loading ? (
          <p className="inline-flex items-center gap-2 text-sm font-bold text-[var(--steel)]"><Loader2 className="h-4 w-4 animate-spin" /> Loading purchases…</p>
        ) : purchases.length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {purchases.slice(0, 6).map((purchase) => (
              <Card key={purchase.transactionId} className="p-5">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[var(--signal)]"><PackageCheck className="h-4 w-4" /> Order #{purchase.transactionId}</div>
                <p className="mt-2 text-base font-black">{purchase.businessName ?? "King Sparkon Mall"}</p>
                <p className="mt-1 text-sm font-bold text-[var(--steel)]">{purchase.items?.length ?? 0} items · R{(purchase.netTotal ?? purchase.productTotal ?? 0).toFixed(2)}</p>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <ShoppingBag className="mx-auto h-8 w-8 text-[var(--signal)]" />
            <p className="mt-2 text-sm font-bold text-[var(--steel)]">No mall purchases yet. Checkout below and they will show up here.</p>
          </Card>
        )}
      </section>

      <section className="grid gap-4">
        <SectionHeader title="Browse the mall" description="Same catalogue as the user shop, inside the artist dashboard" eyebrow="SHOP" />
        <TuckShopDashboard />
        <p className="text-xs font-semibold text-[var(--muted)]">Checkout uses the shared <Link href="/dashboard/user/shop/cart" className="font-black text-[var(--signal)]">cart flow</Link>. Purchases are linked to your artist account.</p>
      </section>
    </div>
  );
}

export function artistMallPurchasesErrorFallback(error: unknown) {
  return normalizeApiError(error).message;
}
