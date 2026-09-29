"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { WalletCards } from "lucide-react";
import { getArtistBalance } from "@/services/eventSetService";
import { money } from "@/lib/tuck-shop/cart";

export function ArtistBalanceHeaderAction() {
  const [balance, setBalance] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getArtistBalance()
      .then((result) => {
        if (mounted) setBalance(money(result.totalAvailable ?? 0));
      })
      .catch(() => {
        if (mounted) setBalance(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  if (balance === null) return null;

  return (
    <div className="flex flex-col items-center gap-1">
      <Link
        href="/dashboard/artist/payouts"
        title={`Booking balance ${balance}`}
        className="inline-flex h-11 shrink-0 items-center gap-2 rounded-full border border-[var(--line)] bg-white px-4 text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--gold)]"
      >
        <WalletCards className="h-4 w-4 text-[var(--signal)]" />
        <span className="money text-sm font-black">{balance}</span>
      </Link>
      <span className="text-[0.6rem] font-extrabold uppercase leading-none tracking-[0.08em] text-[var(--steel)]" aria-hidden="true">Balance</span>
    </div>
  );
}
