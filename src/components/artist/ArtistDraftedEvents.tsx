"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { EventCard, EventCardSkeleton } from "./EventCard";
import type { ArtistType, DraftedEvent } from "@/types/artist";
import { getDraftedEvents } from "@/services/artistService";

const filterOptions: Array<ArtistType | "ALL"> = ["ALL", "DJ", "MUSICIAN", "MCEE"];

export function ArtistDraftedEvents({ initialEvents }: { initialEvents?: DraftedEvent[] }) {
  const allEvents = useMemo(() => initialEvents ?? getDraftedEvents(), [initialEvents]);
  const [query, setQuery] = useState("");
  const [artistFilter, setArtistFilter] = useState<ArtistType | "ALL">("ALL");
  const [locationFilter, setLocationFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(false);

  const filtered = useMemo(() => {
    return allEvents.filter((ev) => {
      if (artistFilter !== "ALL" && ev.artistType !== artistFilter) return false;
      if (query && !ev.title.toLowerCase().includes(query.toLowerCase()) && !ev.description.toLowerCase().includes(query.toLowerCase())) return false;
      if (locationFilter && !ev.location.toLowerCase().includes(locationFilter.toLowerCase())) return false;
      if (dateFilter && ev.eventDate !== dateFilter) return false;
      return true;
    });
  }, [allEvents, query, artistFilter, locationFilter, dateFilter]);

  return (
    <div className="grid gap-6 p-5 md:p-8">
      <div>
        <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[var(--signal)]">Opportunities</p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] md:text-4xl">Drafted Events</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--steel)]">Discover events looking for artists.</p>
      </div>

      {/* Search and filters */}
      <div className="rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:p-5">
        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.6fr]">
          <label className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 shadow-[var(--shadow-soft)] focus-within:border-[var(--signal)] focus-within:ring-4 focus-within:ring-[var(--signal)]/10">
            <Search className="h-4 w-4 shrink-0 text-[var(--signal)]" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, venues..."
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
            />
          </label>
          <label className="flex items-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-2">
            <SlidersHorizontal className="h-4 w-4 text-[var(--signal)]" />
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location"
              className="w-full bg-transparent text-sm font-semibold outline-none placeholder:text-[var(--muted)]"
            />
          </label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-full border border-[var(--line)] bg-white px-4 py-2.5 text-sm font-semibold outline-none focus:border-[var(--signal)]"
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setArtistFilter(opt)}
              className={`rounded-full border px-4 py-2 text-xs font-black uppercase tracking-[0.08em] transition ${
                artistFilter === opt ? "border-[var(--signal)] bg-[var(--signal)] text-white" : "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--line-strong)]"
              }`}
            >
              {opt === "ALL" ? "All" : opt}
            </button>
          ))}
          {dateFilter || locationFilter || query || artistFilter !== "ALL" ? (
            <button
              onClick={() => {
                setQuery("");
                setLocationFilter("");
                setDateFilter("");
                setArtistFilter("ALL");
              }}
              className="ml-2 text-xs font-black text-[var(--signal)] hover:text-[var(--signal-strong)]"
            >
              Clear filters
            </button>
          ) : null}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[var(--radius-2xl)] border border-dashed border-[var(--line)] bg-white p-12 text-center">
          <span className="text-4xl">🎤</span>
          <h3 className="mt-4 text-xl font-black">No performance opportunities yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--steel)]">New events looking for artists will appear here.</p>
          <button
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 600);
            }}
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 text-sm font-black text-white hover:bg-[var(--signal-strong)]"
          >
            Refresh Events
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => <EventCardSkeleton key={i} />)
            : filtered.map((ev) => <EventCard key={ev.id} event={ev} href={`/dashboard/artist/events/${ev.id}`} />)}
        </div>
      )}
    </div>
  );
}
