import type { ArtistBooking, ArtistBookingStatus, ArtistProfile, DraftedEvent } from "@/types/artist";

const BOOKINGS_STORAGE_KEY = "king-sparkon-artist-bookings";
const PROFILE_STORAGE_KEY = "king-sparkon-artist-profile";

export function formatZAR(amount: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);
}

// API MISSING: there is currently no backend endpoint for artist profiles,
// drafted events, bookings or schedules (no src/app/api route, no
// src/lib/api helper). Artist data below is limited to records the signed-in
// user created locally. Drafted events always return [] until the backend
// exposes them.

// ─── Persistence helpers (user-created records only, no seeds) ──────────────
function loadBookings(): ArtistBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ArtistBooking[];
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch {}
  return [];
}

function saveBookings(bookings: ArtistBooking[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent("king-sparkon:artist-bookings", { detail: bookings }));
  } catch {}
}

function loadArtistProfile(): ArtistProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ArtistProfile;
  } catch {}
  return null;
}

function saveArtistProfile(profile: ArtistProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

// ─── Public API ────────────────────────────────────────────────────────────
export function getArtistProfile(): ArtistProfile | null {
  return loadArtistProfile();
}

export function createArtistProfile(profile: ArtistProfile): ArtistProfile {
  saveArtistProfile(profile);
  return profile;
}

export function updateArtistProfile(patch: Partial<ArtistProfile>): ArtistProfile | null {
  const current = loadArtistProfile();
  if (!current) return null;
  const next = { ...current, ...patch };
  saveArtistProfile(next);
  return next;
}

export function getArtistById(id: string): ArtistProfile | undefined {
  const current = loadArtistProfile();
  return current && current.id === id ? current : undefined;
}

export function getAllArtists(): ArtistProfile[] {
  const current = loadArtistProfile();
  return current ? [current] : [];
}

export function getDraftedEvents(): DraftedEvent[] {
  return [];
}

export function getDraftedEventById(_id: string): DraftedEvent | undefined {
  return undefined;
}

export function getBookingsForEvent(eventId: string): ArtistBooking[] {
  return loadBookings().filter((b) => b.eventId === eventId);
}

export function getBookingsForArtist(artistId?: string): ArtistBooking[] {
  if (!artistId) return loadBookings();
  return loadBookings().filter((b) => b.artistId === artistId);
}

export function getBookedEventsForArtist(_artistId?: string): Array<DraftedEvent & { booking: ArtistBooking }> {
  return [];
}

export function getUpcomingPerformances(_artistId?: string): Array<DraftedEvent & { booking: ArtistBooking }> {
  return [];
}

export function getRequestStatus(eventId: string, artistId?: string): ArtistBookingStatus | null {
  const bookings = artistId
    ? loadBookings().filter((x) => x.artistId === artistId)
    : loadBookings();
  const b = bookings.find((x) => x.eventId === eventId);
  return b ? b.status : null;
}

export function requestToPerform(eventId: string, artistId: string): ArtistBooking {
  const bookings = loadBookings();
  const existing = bookings.find((b) => b.eventId === eventId && b.artistId === artistId);
  if (existing) return existing;
  const profile = getArtistById(artistId);
  const newBooking: ArtistBooking = {
    id: `bk-${Date.now()}`,
    eventId,
    artistId,
    artistName: profile?.displayName ?? "Artist",
    artistType: profile?.artistType ?? "DJ",
    artistAvatarUrl: profile?.avatarUrl,
    status: "PENDING",
    requestedAt: new Date().toISOString(),
    bookingFee: profile?.minimumBookingFee ?? 0,
    performancesPerDay: profile?.performancesPerDay ?? 1,
  };
  const next = [...bookings, newBooking];
  saveBookings(next);
  return newBooking;
}

export function respondToBooking(bookingId: string, status: ArtistBookingStatus): void {
  const bookings = loadBookings();
  const next = bookings.map((b) => (b.id === bookingId ? { ...b, status, respondedAt: new Date().toISOString() } : b));
  saveBookings(next);
}

export function getArtistDashboardStats(): {
  upcomingBookings: number;
  pendingRequests: number;
  thisMonthPerformances: number;
  minimumFee: number;
} {
  const profile = loadArtistProfile();
  const bookings = profile ? loadBookings().filter((b) => b.artistId === profile.id) : [];
  const upcoming = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "CONFIRMED").length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;
  return { upcomingBookings: upcoming, pendingRequests: pending, thisMonthPerformances: upcoming, minimumFee: profile?.minimumBookingFee ?? 0 };
}

export function getScheduleMap(): Record<string, Array<DraftedEvent & { booking: ArtistBooking }>> {
  return {};
}
