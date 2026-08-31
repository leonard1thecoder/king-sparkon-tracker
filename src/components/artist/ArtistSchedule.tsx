"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Clock, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatZAR, getScheduleMap } from "@/services/artistService";

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}
function startWeekday(year: number, month: number) {
  const d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1; // Mon=0
}
const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const weekdaysMobile = ["M", "T", "W", "T", "F", "S", "S"];
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export function ArtistSchedule() {
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(8); // September (0-indexed)
  const [selected, setSelected] = useState<string | null>("2026-09-14");
  const scheduleMap = useMemo(() => getScheduleMap(), []);
  const totalDays = daysInMonth(year, month);
  const offset = startWeekday(year, month);
  const cells: Array<number | null> = [...Array(offset).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const selectedEvents = selected ? scheduleMap[selected] ?? [] : [];

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  };

  return (
    <div className="grid gap-6 p-5 md:p-8">
      <div>
        <h1 className="text-3xl font-black tracking-[-0.04em]">My Schedule</h1>
        <p className="mt-1 text-sm text-[var(--steel)]">Keep track of your upcoming performances.</p>
      </div>

      {/* Desktop layout */}
      <div className="hidden md:grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <button onClick={prevMonth} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] hover:bg-[var(--surface)]">‹</button>
            <h2 className="text-lg font-black">{monthNames[month]} {year}</h2>
            <button onClick={nextMonth} className="grid h-9 w-9 place-items-center rounded-full border border-[var(--line)] hover:bg-[var(--surface)]">›</button>
          </div>
          <div className="mt-6 grid grid-cols-7 gap-1 text-center text-xs font-black uppercase tracking-[0.08em] text-[var(--muted)]">
            {weekdays.map((w) => (
              <div key={w} className="py-2">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
              const hasEvent = day ? Boolean(scheduleMap[dateStr]?.length) : false;
              const isSelected = dateStr === selected;
              return (
                <button
                  key={idx}
                  disabled={!day}
                  onClick={() => day && setSelected(dateStr)}
                  className={`relative grid h-12 place-items-center rounded-xl border text-sm font-bold transition ${!day ? "border-transparent" : isSelected ? "border-[var(--signal)] bg-[var(--signal)] text-white" : hasEvent ? "border-[var(--signal-soft)] bg-[var(--signal-soft)] text-[var(--signal-strong)] hover:bg-[var(--signal)] hover:text-white" : "border-[var(--line)] bg-white hover:bg-[var(--surface)]"}`}
                >
                  {day ?? ""}
                  {hasEvent && !isSelected ? <span className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-[var(--signal)]" /> : null}
                </button>
              );
            })}
          </div>
        </Card>

        <Card className="p-5 h-fit">
          {selected ? (
            <>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{selected}</p>
              {selectedEvents.length ? (
                <div className="mt-3 grid gap-3">
                  {selectedEvents.map((ev) => (
                    <div key={ev.id} className="rounded-xl border border-[var(--line)] bg-white p-4">
                      <p className="font-black">{ev.title}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--steel)]"><Clock className="h-3.5 w-3.5" /> {ev.startTime} – {ev.endTime}</p>
                      <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--steel)]"><MapPin className="h-3.5 w-3.5" /> {ev.location}</p>
                      <p className="mt-1 text-xs font-black text-[var(--signal-strong)]">{formatZAR(ev.bookingFee)}</p>
                      <Link href={`/dashboard/artist/events/${ev.id}`} className="mt-3 inline-flex min-h-9 items-center justify-center rounded-full border border-[var(--signal)] bg-white px-4 text-xs font-black hover:bg-[var(--signal)] hover:text-white">View Event</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center">
                  <span className="text-2xl">📅</span>
                  <p className="mt-2 text-sm font-black">No events</p>
                  <p className="text-xs text-[var(--steel)]">No performances on this day.</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-[var(--steel)]">Select a date to see events.</p>
          )}
        </Card>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-black">{monthNames[month]} {year}</h2>
            <div className="flex gap-2">
              <button onClick={prevMonth} className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)]">‹</button>
              <button onClick={nextMonth} className="grid h-8 w-8 place-items-center rounded-full border border-[var(--line)]">›</button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[0.68rem] font-black uppercase tracking-[0.08em] text-[var(--muted)]">
            {weekdaysMobile.map((w) => (
              <div key={w} className="py-1">{w}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              const dateStr = day ? `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` : "";
              const hasEvent = day ? Boolean(scheduleMap[dateStr]?.length) : false;
              const isSelected = dateStr === selected;
              return (
                <button
                  key={idx}
                  disabled={!day}
                  onClick={() => day && setSelected(dateStr)}
                  className={`relative grid h-9 place-items-center rounded-xl border text-xs font-bold ${!day ? "border-transparent" : isSelected ? "border-[var(--signal)] bg-[var(--signal)] text-white" : hasEvent ? "bg-[var(--signal-soft)] border-[var(--signal-soft)] text-[var(--signal-strong)]" : "border-[var(--line)] bg-white"}`}
                >
                  {day ?? ""}
                  {hasEvent && !isSelected ? <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-[var(--signal)]" /> : null}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="mt-4 rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-4">
          <div className="h-px bg-[var(--line)]" />
          <div className="pt-4">
            {selected ? (
              <>
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">{new Date(selected + "T12:00:00").toLocaleDateString("en-ZA", { weekday: "long", day: "numeric", month: "long" })}</p>
                {selectedEvents.length ? (
                  <div className="mt-3 grid gap-3">
                    {selectedEvents.map((ev) => (
                      <div key={ev.id} className="rounded-xl border border-[var(--line)] p-4">
                        <p className="font-black">{ev.title}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--steel)]"><Clock className="h-3.5 w-3.5" /> {ev.startTime} – {ev.endTime}</p>
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--steel)]"><MapPin className="h-3.5 w-3.5" /> {ev.location}</p>
                        <Link href={`/dashboard/artist/events/${ev.id}`} className="mt-3 inline-flex min-h-9 w-full items-center justify-center rounded-full bg-[var(--signal)] px-4 text-xs font-black text-white">View Event</Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-dashed bg-[var(--surface)] p-6 text-center">
                    <span className="text-2xl">📅</span>
                    <p className="mt-2 text-sm font-black">Your schedule is clear</p>
                    <p className="text-xs text-[var(--steel)]">You don&apos;t have any performances booked yet.</p>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
