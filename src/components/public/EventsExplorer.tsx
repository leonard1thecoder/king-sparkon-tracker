"use client";

import { useMemo, useState } from "react";
import { EventCard, type EventCardData } from "@/components/public/EventCard";

type SortMode = "soonest" | "name";

export function EventsExplorer({ events }: { events: EventCardData[] }) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortMode>("soonest");

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle ? events.filter((event) => event.searchText.includes(needle)) : events;
    const sorted = [...filtered];
    if (sort === "soonest") {
      sorted.sort((a, b) => a.sortKey.localeCompare(b.sortKey));
    } else {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
    return sorted;
  }, [events, query, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="ks-surface flex w-full items-center gap-3 rounded-full border border-[var(--ks-line)] px-5 py-3 md:max-w-md">
          <span className="sr-only">Search events</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by name, venue or description"
            className="w-full bg-transparent text-sm outline-none placeholder:text-[var(--ks-muted)]"
          />
        </label>
        <div role="group" aria-label="Sort events" className="flex gap-2">
          {(["soonest", "name"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              aria-pressed={sort === mode}
              onClick={() => setSort(mode)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                sort === mode
                  ? "border-[var(--ks-ink)] bg-[var(--ks-ink)] text-white"
                  : "border-[var(--ks-line)] ks-surface hover:bg-[var(--ks-light-green)]"
              }`}
            >
              {mode === "soonest" ? "Soonest" : "Name"}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-[var(--ks-muted)]" aria-live="polite">
        {visible.length} {visible.length === 1 ? "event" : "events"} shown
      </p>

      {visible.length > 0 ? (
        <ul className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((event) => (
            <li key={event.id}>
              <EventCard event={event} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-10 rounded-[var(--ks-radius)] border border-dashed border-[var(--ks-line)] p-8 text-center text-sm text-[var(--ks-muted)]">
          No events match that search.
        </p>
      )}
    </div>
  );
}
