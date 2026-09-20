"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Heart, Loader2, QrCode, Search, UsersRound } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusPill } from "@/components/ui/StatusPill";
import { normalizeApiError } from "@/lib/api/client";
import {
  listBusinessWorkers,
  listUserBusinesses,
  type UserBusinessCard,
  type WorkerTipCard,
} from "@/lib/api/user-dashboard";
import {
  isWorkerFavorited,
  readFavoriteWorkers,
  toggleFavoriteWorker,
  WORKER_FAVORITES_EVENT,
  type FavoriteWorker,
} from "@/lib/worker-favorites";

function workerInitial(name: string): string {
  const trimmed = name.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : "?";
}

function toFavorite(worker: WorkerTipCard, business: UserBusinessCard | null): FavoriteWorker {
  return {
    workerId: worker.workerId,
    username: worker.username,
    jobTitle: worker.jobTitle,
    businessId: business?.businessId ?? null,
    businessName: business?.businessName ?? null,
    profilePictureUrl: worker.profilePictureUrl,
  };
}

export function WorkerBrowser() {
  const [businesses, setBusinesses] = useState<UserBusinessCard[]>([]);
  const [businessId, setBusinessId] = useState<number | null>(null);
  const [workers, setWorkers] = useState<WorkerTipCard[]>([]);
  const [query, setQuery] = useState("");
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<FavoriteWorker[]>([]);

  const activeBusiness = useMemo(
    () => businesses.find((business) => business.businessId === businessId) ?? null,
    [businesses, businessId],
  );

  const loadBusinesses = useCallback(async () => {
    setLoadingBusinesses(true);
    setError(null);
    try {
      const rows = await listUserBusinesses();
      const list = Array.isArray(rows) ? rows : [];
      setBusinesses(list);
      setBusinessId((current) => {
        if (current !== null && list.some((business) => business.businessId === current)) return current;
        return list.length > 0 ? list[0].businessId : null;
      });
    } catch (exception) {
      setBusinesses([]);
      setBusinessId(null);
      setError(normalizeApiError(exception).message);
    } finally {
      setLoadingBusinesses(false);
    }
  }, []);

  const loadWorkers = useCallback(async (id: number) => {
    setLoadingWorkers(true);
    setError(null);
    try {
      const rows = await listBusinessWorkers(id);
      setWorkers(Array.isArray(rows) ? rows : []);
    } catch (exception) {
      setWorkers([]);
      setError(normalizeApiError(exception).message);
    } finally {
      setLoadingWorkers(false);
    }
  }, []);

  useEffect(() => {
    void loadBusinesses();
  }, [loadBusinesses]);

  useEffect(() => {
    if (businessId !== null) void loadWorkers(businessId);
    else setWorkers([]);
  }, [businessId, loadWorkers]);

  useEffect(() => {
    const refresh = () => setFavorites(readFavoriteWorkers());
    refresh();
    window.addEventListener(WORKER_FAVORITES_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(WORKER_FAVORITES_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const visibleWorkers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return workers;
    return workers.filter(
      (worker) =>
        worker.username.toLowerCase().includes(needle) ||
        (worker.jobTitle ?? "").toLowerCase().includes(needle),
    );
  }, [workers, query]);

  return (
    <section className="grid gap-6">
      {favorites.length > 0 ? (
        <Card className="p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-[0.9rem] bg-[var(--ink)] text-[var(--gold)]">
                <Heart className="h-4 w-4" fill="currentColor" />
              </div>
              <div>
                <h3 className="font-black tracking-[-0.03em] text-[var(--ink)]">Favorite workers</h3>
                <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Your saved workers — tip them again in one tap.</p>
              </div>
            </div>
            <StatusPill label={`${favorites.length} SAVED`} tone="confirm" />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {favorites.map((favorite) => (
              <div key={`${favorite.businessId ?? "any"}:${favorite.workerId}`} className="flex items-center gap-3 rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-3">
                {favorite.profilePictureUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={favorite.profilePictureUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                ) : (
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-lg font-black text-[var(--gold)]">
                    {workerInitial(favorite.username)}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-black text-[var(--ink)]">{favorite.username}</p>
                  <p className="truncate text-xs font-semibold text-[var(--steel)]">
                    {favorite.jobTitle || "Worker"}{favorite.businessName ? ` · ${favorite.businessName}` : ""}
                  </p>
                </div>
                <Link
                  href={`/dashboard/user/tips/workers/${encodeURIComponent(String(favorite.workerId))}`}
                  className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-4 text-xs font-black text-white hover:bg-[var(--ink)]"
                >
                  Tip worker
                </Link>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      <Card className="p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-[0.9rem] bg-[var(--ink)] text-[var(--gold)]">
              <UsersRound className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-black tracking-[-0.03em] text-[var(--ink)]">Find workers</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--steel)]">Pick a business, search by name, or scan a worker QR.</p>
            </div>
          </div>
          <Link href="/dashboard/user/tips/scan" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--ink)] bg-white px-5 text-sm font-black text-[var(--ink)] hover:bg-[var(--surface)]">
            <QrCode className="h-4 w-4" /> Scan QR
          </Link>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
            Business
            <select
              value={businessId ?? ""}
              onChange={(event) => setBusinessId(event.target.value ? Number(event.target.value) : null)}
              disabled={loadingBusinesses || businesses.length === 0}
              className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white px-5 text-sm font-bold normal-case tracking-normal text-[var(--ink)] outline-none focus:border-[var(--signal)]"
            >
              {businesses.length === 0 ? <option value="">No businesses available</option> : null}
              {businesses.map((business) => (
                <option key={business.businessId} value={business.businessId}>
                  {business.businessName}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-[var(--steel)]">
            Search name
            <span className="relative block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--steel)]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search worker by name…"
                className="min-h-11 w-full rounded-full border border-[var(--line)] bg-white py-2 pl-11 pr-5 text-sm font-bold normal-case tracking-normal text-[var(--ink)] outline-none placeholder:text-[var(--muted)] focus:border-[var(--signal)]"
              />
            </span>
          </label>
        </div>

        {error ? (
          <p className="mt-4 rounded-[var(--radius-lg)] border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-4 text-sm font-bold text-[var(--danger)]">{error}</p>
        ) : null}

        <div className="mt-4">
          {loadingBusinesses || loadingWorkers ? (
            <div className="flex min-h-40 items-center justify-center gap-3 text-sm font-black text-[var(--steel)]">
              <Loader2 className="h-5 w-5 animate-spin" /> Loading workers
            </div>
          ) : visibleWorkers.length === 0 ? (
            <div className="rounded-[1.25rem] border border-[var(--line)] bg-[var(--surface)] p-10 text-center">
              <UsersRound className="mx-auto h-10 w-10 text-[var(--signal)]" />
              <p className="mt-3 text-lg font-black text-[var(--ink)]">
                {workers.length === 0 ? "No workers found for this business" : "No workers match your search"}
              </p>
              <p className="mt-2 text-sm text-[var(--steel)]">Try another business, a different name, or scan a worker QR code.</p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visibleWorkers.map((worker) => {
                const favorited = isWorkerFavorited(worker.workerId, activeBusiness?.businessId ?? null);
                return (
                  <div key={worker.workerId} className="grid gap-3 rounded-[1.5rem] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)]">
                    <div className="flex items-center gap-3">
                      {worker.profilePictureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={worker.profilePictureUrl} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
                      ) : (
                        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--ink)] text-xl font-black text-[var(--gold)]">
                          {workerInitial(worker.username)}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-black text-[var(--ink)]">{worker.username}</p>
                        <p className="truncate text-xs font-semibold text-[var(--steel)]">
                          {worker.jobTitle || "Worker"}{activeBusiness ? ` · ${activeBusiness.businessName}` : ""}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => toggleFavoriteWorker(toFavorite(worker, activeBusiness))}
                        aria-pressed={favorited}
                        aria-label={favorited ? `Remove ${worker.username} from favorites` : `Add ${worker.username} to favorites`}
                        title={favorited ? "Remove from favorites" : "Add to favorites"}
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border transition ${
                          favorited
                            ? "border-[var(--signal)] bg-[var(--signal)] text-white"
                            : "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--signal)] hover:text-[var(--signal)]"
                        }`}
                      >
                        <Heart className="h-4 w-4" fill={favorited ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <Link
                      href={`/dashboard/user/tips/workers/${encodeURIComponent(String(worker.workerId))}`}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white shadow-[var(--shadow-soft)] hover:bg-[var(--ink)]"
                    >
                      Tip worker
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </section>
  );
}
