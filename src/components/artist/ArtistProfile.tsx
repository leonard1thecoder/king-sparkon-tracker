"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Globe2, MapPin, Music, Share2, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatZAR, getArtistById, getArtistProfile, getUpcomingPerformances, updateArtistProfile } from "@/services/artistService";
import type { ArtistProfile } from "@/types/artist";
import { Skeleton } from "@/components/ui/Skeleton";

export function ArtistProfileView({ artistId, editable = false }: { artistId?: string; editable?: boolean }) {
  const [profile, setProfile] = useState<ArtistProfile | null>(null);
  const [upcoming, setUpcoming] = useState<ReturnType<typeof getUpcomingPerformances>>([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<ArtistProfile>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const p = artistId ? getArtistById(artistId) ?? getArtistProfile() : getArtistProfile();
    setProfile(p ?? null);
    setForm(p ?? {});
    setUpcoming(getUpcomingPerformances(p?.id));
    const t = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(t);
  }, [artistId]);

  if (loading || !profile) {
    return (
      <div className="grid gap-6 p-5 md:p-8">
        <Skeleton className="h-64" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const handleSave = () => {
    const next = updateArtistProfile(form as ArtistProfile);
    setProfile(next);
    setEditing(false);
  };

  return (
    <div className="grid gap-6 pb-10">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="relative h-56 w-full md:h-72">
          <Image src={profile.coverUrl} alt="Cover" fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        </div>
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <div className="relative -mt-16 flex flex-col items-center gap-4 rounded-[var(--radius-2xl)] border border-[var(--line)] bg-white p-6 shadow-[var(--shadow-ledger)] md:flex-row md:items-end md:p-8">
            <Image src={profile.avatarUrl} alt={profile.displayName} width={96} height={96} className="h-24 w-24 rounded-[var(--radius-2xl)] border-4 border-white object-cover shadow-[var(--shadow-soft)]" />
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl font-black tracking-[-0.02em]">{profile.displayName}</h1>
              <p className="mt-1 inline-flex rounded-full border border-[var(--line-strong)] bg-[var(--signal-soft)] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[var(--signal-strong)]">{profile.artistType}</p>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold text-[var(--steel)] md:justify-start"><MapPin className="h-3.5 w-3.5" /> {profile.location}</p>
            </div>
            <div className="flex gap-2">
              <a href={profile.socialLinks.instagram} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-white hover:bg-[var(--surface)]" aria-label="Instagram"><Globe2 className="h-4 w-4" /></a>
              <a href={profile.socialLinks.facebook} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-white hover:bg-[var(--surface)]" aria-label="Facebook"><Share2 className="h-4 w-4" /></a>
              <a href={profile.socialLinks.tiktok} target="_blank" rel="noreferrer" className="grid h-10 w-10 place-items-center rounded-full border border-[var(--line)] bg-white hover:bg-[var(--surface)]" aria-label="TikTok"><Music className="h-4 w-4" /></a>
            </div>
            {editable ? (
              <Button variant={editing ? "primary" : "secondary"} onClick={() => (editing ? handleSave() : setEditing(true))}>
                {editing ? "Save" : "Edit Profile"}
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-6 px-5 md:px-8 lg:grid-cols-[1.6fr_0.9fr]">
        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-black">About</h2>
            {editing ? (
              <textarea
                value={form.bio ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                className="mt-3 min-h-24 w-full rounded-xl border border-[var(--line)] bg-white p-3 text-sm leading-6 outline-none focus:border-[var(--signal)]"
              />
            ) : (
              <p className="mt-3 text-sm leading-7 text-[var(--steel)]">{profile.bio}</p>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-black">Artist Information</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Artist Type</p>
                {editing ? (
                  <select
                    value={form.artistType ?? profile.artistType}
                    onChange={(e) => setForm((f) => ({ ...f, artistType: e.target.value as ArtistProfile["artistType"] }))}
                    className="mt-2 w-full rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold outline-none"
                  >
                    <option value="DJ">DJ</option>
                    <option value="MUSICIAN">MUSICIAN</option>
                    <option value="MCEE">MCEE</option>
                  </select>
                ) : (
                  <p className="mt-2 text-sm font-black">{profile.artistType}</p>
                )}
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Minimum Fee</p>
                {editing ? (
                  <input
                    type="number"
                    value={form.minimumBookingFee ?? profile.minimumBookingFee}
                    onChange={(e) => setForm((f) => ({ ...f, minimumBookingFee: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold outline-none"
                  />
                ) : (
                  <p className="mt-2 flex items-center gap-1 text-sm font-black"><Wallet className="h-4 w-4 text-[var(--signal)]" /> {formatZAR(profile.minimumBookingFee)}</p>
                )}
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
                <p className="text-xs font-black uppercase tracking-[0.1em] text-[var(--muted)]">Per Day</p>
                {editing ? (
                  <input
                    type="number"
                    value={form.performancesPerDay ?? profile.performancesPerDay}
                    onChange={(e) => setForm((f) => ({ ...f, performancesPerDay: Number(e.target.value) }))}
                    className="mt-2 w-full rounded-full border border-[var(--line)] bg-white px-3 py-2 text-sm font-bold outline-none"
                  />
                ) : (
                  <p className="mt-2 text-sm font-black">{profile.performancesPerDay}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader><CardTitle>Upcoming Performances</CardTitle></CardHeader>
            <CardContent className="grid gap-3">
              {upcoming.length ? (
                upcoming.slice(0, 3).map((ev) => (
                  <Link key={ev.id} href={`/dashboard/artist/events/${ev.id}`} className="flex gap-3 rounded-xl border border-[var(--line)] p-3 hover:bg-[var(--surface)]">
                    <Image src={ev.imageUrl} alt={ev.title} width={64} height={64} className="h-16 w-16 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-black">{ev.title}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-[var(--steel)]"><Calendar className="h-3 w-3" /> {ev.eventDate}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm font-semibold text-[var(--steel)]">No upcoming performances.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
