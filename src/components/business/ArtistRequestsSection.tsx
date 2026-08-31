"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { Toast } from "@/components/ui/Toast";
import { ArtistStatusBadge } from "@/components/artist/ArtistStatusBadge";
import { formatZAR, getArtistById, getBookingsForEvent, respondToBooking } from "@/services/artistService";
import type { ArtistBooking } from "@/types/artist";

export function ArtistRequestsSection({ eventId, eventTitle, eventDate, eventTime }: { eventId: string; eventTitle: string; eventDate: string; eventTime: string }) {
  const [bookings, setBookings] = useState<ArtistBooking[]>([]);
  const [acceptId, setAcceptId] = useState<string | null>(null);
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [toast, setToast] = useState("");

  const load = () => {
    const existing = getBookingsForEvent(eventId);
    if (existing.length === 0) {
      // Fallback demo for Business Owner view — show 3 polished requests per spec when no real data yet (e.g., ticket events)
      const demo: ArtistBooking[] = [
        {
          id: `demo-${eventId}-1`,
          eventId,
          artistId: "artist-current",
          artistName: "DJ Spark",
          artistType: "DJ",
          artistAvatarUrl: "https://i.pravatar.cc/300?img=68",
          status: "PENDING",
          requestedAt: new Date().toISOString(),
          bookingFee: 2000,
          performancesPerDay: 3,
        },
        {
          id: `demo-${eventId}-2`,
          eventId,
          artistId: "artist-2",
          artistName: "MCEE Rhyme",
          artistType: "MCEE",
          artistAvatarUrl: "https://i.pravatar.cc/300?img=12",
          status: "PENDING",
          requestedAt: new Date().toISOString(),
          bookingFee: 2000,
          performancesPerDay: 2,
        },
        {
          id: `demo-${eventId}-3`,
          eventId,
          artistId: "artist-3",
          artistName: "Thandi Keys",
          artistType: "MUSICIAN",
          artistAvatarUrl: "https://i.pravatar.cc/300?img=32",
          status: "PENDING",
          requestedAt: new Date().toISOString(),
          bookingFee: 3200,
          performancesPerDay: 1,
        },
      ];
      setBookings(demo);
    } else {
      setBookings(existing);
    }
  };
  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener("king-sparkon:artist-bookings", h);
    return () => window.removeEventListener("king-sparkon:artist-bookings", h);
  }, [eventId]);

  const handleAccept = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    if (id.startsWith("demo-")) {
      setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status: "ACCEPTED" as const } : x)));
    } else {
      respondToBooking(id, "ACCEPTED");
      load();
    }
    setAcceptId(null);
    setToast(`${b?.artistName ?? "Artist"} has been accepted for this event.`);
    setTimeout(() => setToast(""), 3000);
  };
  const handleReject = (id: string) => {
    if (id.startsWith("demo-")) {
      setBookings((prev) => prev.map((x) => (x.id === id ? { ...x, status: "REJECTED" as const } : x)));
    } else {
      respondToBooking(id, "REJECTED");
      load();
    }
    setRejectId(null);
    setToast("Request rejected.");
    setTimeout(() => setToast(""), 3000);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Artists</CardTitle>
          <p className="mt-1 text-xs font-bold text-[var(--muted)]">{bookings.length} requests</p>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        {bookings.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-8 text-center text-sm font-semibold text-[var(--steel)]">No artist requests yet.</p>
        ) : (
          bookings.map((b) => {
            const profile = getArtistById(b.artistId);
            return (
              <div key={b.id} className="flex flex-col gap-4 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white p-4 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <Image src={b.artistAvatarUrl ?? profile?.avatarUrl ?? "https://i.pravatar.cc/100"} alt={b.artistName} width={56} height={56} className="h-14 w-14 rounded-full border object-cover" />
                  <div className="min-w-0">
                    <p className="font-black leading-5">{b.artistName}</p>
                    <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">{b.artistType}</p>
                    <div className="mt-1 flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[var(--signal-soft)] px-2.5 py-1 font-bold text-[var(--signal-strong)]">Min fee {formatZAR(b.bookingFee)}</span>
                      <span className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 font-bold">{b.performancesPerDay ?? profile?.performancesPerDay ?? 1} performances/day</span>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 md:min-w-[280px]">
                  <div className="flex items-center justify-between gap-2">
                    <ArtistStatusBadge status={b.status} />
                    <Link href={`/dashboard/owner/artists/${b.artistId}`} className="text-xs font-black text-[var(--signal)] hover:text-[var(--signal-strong)]">View Profile</Link>
                  </div>
                  {b.status === "PENDING" ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="quiet" onClick={() => setRejectId(b.id)} className="border-[var(--line)]">
                        <X className="h-4 w-4" /> Reject
                      </Button>
                      <Button onClick={() => setAcceptId(b.id)} className="bg-emerald-600 border-emerald-600 hover:bg-emerald-700">
                        <Check className="h-4 w-4" /> Accept Artist
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-xs font-bold text-[var(--steel)]">{b.status === "ACCEPTED" ? "Accepted — booking confirmed" : b.status === "REJECTED" ? "Rejected" : b.status}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>

      {/* Accept Dialog */}
      <Modal open={Boolean(acceptId)} title="Accept Artist" onClose={() => setAcceptId(null)}>
        {acceptId ? (
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-[var(--steel)]">
              Accept <span className="font-black text-[var(--ink)]">{bookings.find((b) => b.id === acceptId)?.artistName}</span> for:
            </p>
            <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
              <p className="font-black">{eventTitle}</p>
              <p className="mt-1 text-sm font-semibold text-[var(--steel)]">{eventDate} • {eventTime}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="quiet" onClick={() => setAcceptId(null)}>Cancel</Button>
              <Button onClick={() => handleAccept(acceptId)}>Accept Artist</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal open={Boolean(rejectId)} title="Reject Artist" onClose={() => setRejectId(null)}>
        {rejectId ? (
          <div className="grid gap-4">
            <p className="text-sm leading-6 text-[var(--steel)]">
              Are you sure you want to reject <span className="font-black">{bookings.find((b) => b.id === rejectId)?.artistName}&apos;s</span> performance request?
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="quiet" onClick={() => setRejectId(null)}>Cancel</Button>
              <Button variant="danger" onClick={() => handleReject(rejectId)}>Reject Request</Button>
            </div>
          </div>
        ) : null}
      </Modal>

      {toast ? <Toast message={toast} tone="confirm" /> : null}
    </Card>
  );
}
