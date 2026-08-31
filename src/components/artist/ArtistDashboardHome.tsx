"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin, Music, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EventCard, EventCardSkeleton } from "./EventCard";
import { ArtistStatusBadge } from "./ArtistStatusBadge";
import type { DraftedEvent } from "@/types/artist";
import { formatZAR, getArtistDashboardStats, getArtistProfile, getDraftedEvents, getUpcomingPerformances } from "@/services/artistService";

function Greeting() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return greet;
}

export function ArtistDashboardHome() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(() => getArtistProfile());
  const [stats, setStats] = useState(() => getArtistDashboardStats());
  const [upcoming, setUpcoming] = useState<Array<DraftedEvent & { booking: import("@/types/artist").ArtistBooking }>>([]);
  const [opportunities, setOpportunities] = useState<DraftedEvent[]>([]);

  useEffect(() => {
    const t = setTimeout(() => {
      setProfile(getArtistProfile());
      setStats(getArtistDashboardStats());
      setUpcoming(getUpcomingPerformances());
      setOpportunities(getDraftedEvents().slice(0, 6));
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="grid gap-6 p-5 md:p-8">
        <div className="h-28 rounded-[var(--radius-2xl)] bg-slate-50 animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-8 p-5 md:p-8 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] md:text-4xl">
            {Greeting()}, {profile.displayName} 👋
          </h1>
          <p className="mt-2 text-sm leading-6 text-[var(--steel)] md:text-base">Manage your performances and discover new opportunities.</p>
        </div>
        <Link
          href="/dashboard/artist/drafted"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[var(--signal)] bg-[var(--signal)] px-6 py-2.5 text-sm font-black text-white shadow-[0_8px_20px_rgba(14,165,233,0.18)] hover:bg-[var(--signal-strong)]"
        >
          Browse Events <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Upcoming Bookings</p>
          <p className="mt-2 text-4xl font-black tracking-[-0.04em]">{stats.upcomingBookings}</p>
          <p className="mt-1 text-xs font-bold text-emerald-600">+2 this month</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Pending Requests</p>
          <p className="mt-2 text-4xl font-black tracking-[-0.04em]">{stats.pendingRequests}</p>
          <p className="mt-1 text-xs font-bold text-amber-600">Awaiting response</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">This Month</p>
          <p className="mt-2 text-4xl font-black tracking-[-0.04em]">{stats.thisMonthPerformances}</p>
          <p className="mt-1 text-xs font-bold text-[var(--steel)]">Performances</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-black uppercase tracking-[0.12em] text-[var(--muted)]">Minimum Fee</p>
          <p className="mt-2 flex items-center gap-2 text-3xl font-black tracking-[-0.04em]"><Wallet className="h-6 w-6 text-[var(--signal)]" /> {formatZAR(stats.minimumFee)}</p>
          <p className="mt-1 text-xs font-bold text-[var(--steel)]">Per performance</p>
        </Card>
      </div>

      {/* Upcoming Performances */}
      <section className="grid gap-4">
        <SectionHeader title="Upcoming Performances" description="Your next confirmed events" eyebrow="BOOKED" />
        {upcoming.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {upcoming.slice(0, 3).map((ev) => (
              <Link key={ev.id} href={`/dashboard/artist/events/${ev.id}`} className="group relative overflow-hidden rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-5 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-ledger)] transition">
                <div className="flex items-center justify-between">
                  <ArtistStatusBadge status="ACCEPTED" />
                  <span className="text-xs font-bold text-[var(--muted)]">{new Date(ev.eventDate).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}</span>
                </div>
                <h3 className="mt-3 text-base font-black leading-5 group-hover:text-[var(--signal-strong)]">{ev.title}</h3>
                <div className="mt-2 grid gap-1 text-xs font-semibold text-[var(--steel)]">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-[var(--signal)]" /> {ev.startTime} – {ev.endTime}</span>
                  <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--signal)]" /> {ev.location}</span>
                </div>
                <p className="mt-3 text-xs font-bold text-[var(--signal)]">View event →</p>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-10 text-center">
            <Music className="mx-auto h-10 w-10 text-[var(--signal)]" />
            <p className="mt-3 font-black">No upcoming performances</p>
            <p className="mt-1 text-sm text-[var(--steel)]">Your confirmed bookings will appear here.</p>
            <Link href="/dashboard/artist/drafted" className="mt-4 inline-flex min-h-11 rounded-full bg-[var(--signal)] px-6 py-2.5 text-sm font-black text-white">Browse opportunities</Link>
          </Card>
        )}
      </section>

      {/* Performance Opportunities */}
      <section className="grid gap-4">
        <SectionHeader title="Performance Opportunities" description="Drafted events looking for artists" eyebrow="DISCOVER" actions={<Link href="/dashboard/artist/drafted" className="text-sm font-black text-[var(--signal)] hover:text-[var(--signal-strong)]">View all →</Link>} />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {opportunities.map((ev) => (
            <EventCard key={ev.id} event={ev} href={`/dashboard/artist/events/${ev.id}`} />
          ))}
        </div>
      </section>
    </div>
  );
}
