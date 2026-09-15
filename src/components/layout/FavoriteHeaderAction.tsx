"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { fetchFavoriteKeysFromBackend, readFavoriteBusinessKeys } from "@/lib/favorites";

function countLabel(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function FavoriteHeaderAction() {
  const [count, setCount] = useState(0);
  const [keys, setKeys] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function refreshLocal() {
      const set = readFavoriteBusinessKeys();
      setCount(set.size);
      setKeys(Array.from(set));
    }
    async function refreshFromBackend() {
      try {
        const backendKeys = await fetchFavoriteKeysFromBackend();
        setCount(backendKeys.size);
        setKeys(Array.from(backendKeys));
      } catch {
        refreshLocal();
      }
    }
    refreshLocal();
    void refreshFromBackend();
    window.addEventListener("storage", refreshLocal);
    window.addEventListener("king-sparkon:favorites", refreshLocal as EventListener);
    return () => {
      window.removeEventListener("storage", refreshLocal);
      window.removeEventListener("king-sparkon:favorites", refreshLocal as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-favorite-dropdown]")) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const title = count === 0 ? "No favorites yet" : `${count} favorite business${count === 1 ? "" : "es"}`;

  return (
    <div className="relative flex flex-col items-center gap-1" data-favorite-dropdown>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={title}
        aria-expanded={open}
        aria-haspopup="menu"
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
      </button>
      <span className="text-[0.6rem] font-extrabold uppercase leading-none tracking-[0.08em] text-[var(--steel)]" aria-hidden="true">Favorites</span>

      {open ? (
        <div className="absolute right-0 top-full z-40 w-72 pt-2">
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
            onClick={() => setOpen(false)}
            className="mt-3 flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 text-xs font-black text-rose-600 hover:bg-rose-100"
          >
            <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> View all favorites
          </Link>
          {/* Backend: on click favorites page fetches GET /api/user/favorites and renders business sections */}
        </div>
      </div>
      ) : null}
    </div>
  );
}
