"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { readFavoriteBusinessKeys } from "@/lib/favorites";

function countLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function FavoriteHeaderAction() {
  const [count, setCount] = useState(0);
  const [keys, setKeys] = useState<string[]>([]);

  useEffect(() => {
    function refresh() {
      const set = readFavoriteBusinessKeys();
      setCount(set.size);
      setKeys(Array.from(set));
    }
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("king-sparkon:favorites", refresh as EventListener);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("king-sparkon:favorites", refresh as EventListener);
    };
  }, []);

  const title = count === 0 ? "No favorites yet" : `${count} favorite business${count === 1 ? "" : "es"}`;

  return (
    <div className="relative group">
      <Link
        href="/dashboard/user/favorites"
        aria-label={title}
        title="View favorites"
        className="relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border bg-white text-[var(--ink)] shadow-[var(--shadow-soft)] transition hover:-translate-y-0.5 hover:border-[var(--line-strong)] hover:bg-[var(--surface)]"
      >
        <Heart className={`h-4.5 w-4.5 ${count > 0 ? "fill-rose-500 text-rose-500" : "text-[var(--steel)]"}`} />
        {count > 0 ? (
          <span
            className="absolute -right-1.5 -top-1.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-rose-500 px-1 text-[0.62rem] font-black leading-none text-white shadow-md"
            aria-label={`${count} favorites`}
          >
            {countLabel(count)}
          </span>
        ) : null}
      </Link>

      {/* Hover dropdown */}
      <div className="pointer-events-none absolute right-0 top-full z-40 hidden w-72 -translate-y-1 pt-2 opacity-0 transition-all duration-200 group-hover:block group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:block group-focus-within:opacity-100">
        <div className="rounded-xl border border-[var(--line)] bg-white p-3 shadow-[var(--shadow-ledger)]">
          <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">Favorites</p>
          <p className="mt-1 text-xs font-semibold text-[var(--muted)]">{title}</p>
          {keys.length > 0 ? (
            <ul className="mt-3 grid max-h-48 gap-1.5 overflow-auto pr-1">
              {keys.slice(0, 8).map((k) => (
                <li key={k} className="truncate rounded-lg border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-xs font-bold text-[var(--ink)]">
                  {k}
                </li>
              ))}
              {keys.length > 8 ? <li className="text-center text-xs font-semibold text-[var(--muted)]">+{keys.length - 8} more</li> : null}
            </ul>
          ) : (
            <p className="mt-3 rounded-lg border border-dashed border-[var(--line)] bg-[var(--surface)] p-3 text-center text-xs font-semibold text-[var(--muted)]">Tap the heart on any business to favorite it.</p>
          )}
          <Link
            href="/dashboard/user/favorites"
            className="mt-3 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-600 hover:bg-rose-100"
          >
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> View all favorites
          </Link>
          {/* Backend: on click favorites page fetches GET /api/user/favorites and renders business sections */}
        </div>
      </div>
    </div>
  );
}
