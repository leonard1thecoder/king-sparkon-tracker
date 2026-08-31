import type { ArtistBooking, ArtistBookingStatus, ArtistProfile, ArtistType, DraftedEvent } from "@/types/artist";

const BOOKINGS_STORAGE_KEY = "king-sparkon-artist-bookings";
const PROFILE_STORAGE_KEY = "king-sparkon-artist-profile";

function formatZAR(amount: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", maximumFractionDigits: 0 }).format(amount);
}

// ─── Mock Artist Profile ───────────────────────────────────────────────────
const mockArtistProfile: ArtistProfile = {
  id: "artist-current",
  username: "dj_spark",
  displayName: "DJ Spark",
  artistType: "DJ",
  performancesPerDay: 3,
  minimumBookingFee: 2500,
  bio: "Emalahleni-based DJ and producer blending Amapiano, Afro House and deep sets. Resident at rooftop sessions and township festivals. Available for club nights, private events and brand activations. Professional setup, on-time, crowd-driven.",
  avatarUrl: "https://i.pravatar.cc/300?img=68",
  coverUrl: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1200&q=80&auto=format&fit=crop",
  location: "Emalahleni, Mpumalanga",
  socialLinks: { instagram: "https://instagram.com", facebook: "https://facebook.com", tiktok: "https://tiktok.com" },
  verified: true,
};

const mockArtists: ArtistProfile[] = [
  mockArtistProfile,
  {
    id: "artist-2",
    username: "mcee_rhyme",
    displayName: "MCEE Rhyme",
    artistType: "MCEE",
    performancesPerDay: 2,
    minimumBookingFee: 2000,
    bio: "Award-winning MCEE and hype host. Energy, crowd control and seamless event flow.",
    avatarUrl: "https://i.pravatar.cc/300?img=12",
    coverUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80&auto=format&fit=crop",
    location: "Johannesburg",
    socialLinks: {},
  },
  {
    id: "artist-3",
    username: "musician_thandi",
    displayName: "Thandi Keys",
    artistType: "MUSICIAN",
    performancesPerDay: 1,
    minimumBookingFee: 3200,
    bio: "Soul vocalist and keys — live band or solo, weddings and corporate stages.",
    avatarUrl: "https://i.pravatar.cc/300?img=32",
    coverUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1200&q=80&auto=format&fit=crop",
    location: "Pretoria",
    socialLinks: {},
  },
];

// ─── Mock Drafted Events ───────────────────────────────────────────────────
const mockDraftedEvents: DraftedEvent[] = [
  {
    id: "evt-1",
    title: "Summer Rooftop Party",
    description:
      "A high-energy rooftop celebration above Emalahleni. Expect sunset grooves, city lights and a curated crowd. We need a versatile DJ who can move from Afro House to Amapiano and keep the terrace alive until close. Professional sound and lighting provided.",
    eventDate: "2026-09-14",
    startTime: "18:00",
    endTime: "23:00",
    location: "Emalahleni",
    venue: "Skyline Rooftop • Emalahleni",
    imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=900&q=80&auto=format&fit=crop",
    businessName: "Skyline Hospitality",
    businessLogoUrl: "https://i.pravatar.cc/100?img=31",
    businessOwnerId: "owner-1",
    artistType: "DJ",
    bookingFee: 2500,
    performanceDuration: 60,
    status: "DRAFTED",
    aboutHost: "Skyline Hospitality runs premium rooftop and lounge venues across Mpumalanga. We host weekly house sessions and partner with local talent.",
    createdAt: "2026-08-20",
  },
  {
    id: "evt-2",
    title: "Midnight Groove Warehouse",
    description: "Underground warehouse edition — raw sound, laser, smoke. Looking for a DJ who lives for the after-hours.",
    eventDate: "2026-09-18",
    startTime: "22:00",
    endTime: "04:00",
    location: "Johannesburg",
    venue: "Maboneng Warehouse",
    imageUrl: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80&auto=format&fit=crop",
    businessName: "Maboneng Collective",
    businessLogoUrl: "https://i.pravatar.cc/100?img=15",
    businessOwnerId: "owner-2",
    artistType: "DJ",
    bookingFee: 4000,
    performanceDuration: 90,
    status: "DRAFTED",
    aboutHost: "Culture hub curating Johannesburg’s underground music scene since 2018.",
    createdAt: "2026-08-22",
  },
  {
    id: "evt-3",
    title: "Acoustic Sunset Sessions",
    description: "Intimate sunset stage at a vineyard. Need a soulful musician — guitar/vocals or keys — for a 60-minute golden-hour set.",
    eventDate: "2026-09-20",
    startTime: "16:00",
    endTime: "19:00",
    location: "Stellenbosch",
    venue: "Berg Vineyard Amphitheatre",
    imageUrl: "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=900&q=80&auto=format&fit=crop",
    businessName: "Cape Vine Events",
    businessLogoUrl: "https://i.pravatar.cc/100?img=24",
    businessOwnerId: "owner-3",
    artistType: "MUSICIAN",
    bookingFee: 3200,
    performanceDuration: 60,
    status: "DRAFTED",
    aboutHost: "Boutique wine estate hosting weekly acoustic sessions with local talent.",
    createdAt: "2026-08-18",
  },
  {
    id: "evt-4",
    title: "Campus Freshers Bash",
    description: "5,000 students, main stage, daylight hype. Need an MCEE to own the mic, run competitions and keep energy at 100%.",
    eventDate: "2026-09-22",
    startTime: "12:00",
    endTime: "18:00",
    location: "Pretoria",
    venue: "University Sports Grounds",
    imageUrl: "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=900&q=80&auto=format&fit=crop",
    businessName: "Campus Live SA",
    businessLogoUrl: "https://i.pravatar.cc/100?img=18",
    businessOwnerId: "owner-4",
    artistType: "MCEE",
    bookingFee: 2800,
    performanceDuration: 45,
    status: "DRAFTED",
    aboutHost: "National student events promoter — 30+ campuses, brand activations and live stages.",
    createdAt: "2026-08-25",
  },
  {
    id: "evt-5",
    title: "Harbour Night Market Live",
    description: "Night market with food stalls, craft, and a central stage. Looking for a musician for family-friendly dinner sets.",
    eventDate: "2026-09-25",
    startTime: "17:00",
    endTime: "21:00",
    location: "Cape Town",
    venue: "V&A Harbour Market",
    imageUrl: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=900&q=80&auto=format&fit=crop",
    businessName: "Harbour Markets Co.",
    businessLogoUrl: "https://i.pravatar.cc/100?img=29",
    businessOwnerId: "owner-5",
    artistType: "MUSICIAN",
    bookingFee: 2200,
    performanceDuration: 90,
    status: "DRAFTED",
    aboutHost: "Curators of Cape Town’s largest night market — 120 vendors, 3 stages.",
    createdAt: "2026-08-20",
  },
  {
    id: "evt-6",
    title: "Township Festival Main Stage",
    description: "Community festival — 10,000 capacity, main stage headline support. Need an MCEE host for the day.",
    eventDate: "2026-09-26",
    startTime: "14:00",
    endTime: "22:00",
    location: "Soweto",
    venue: "Morris Isaacson Park",
    imageUrl: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=900&q=80&auto=format&fit=crop",
    businessName: "Soweto Arts Council",
    businessLogoUrl: "https://i.pravatar.cc/100?img=33",
    businessOwnerId: "owner-6",
    artistType: "MCEE",
    bookingFee: 3500,
    performanceDuration: 60,
    status: "DRAFTED",
    aboutHost: "Community arts council — festivals, workshops, youth stages.",
    createdAt: "2026-08-24",
  },
  {
    id: "evt-7",
    title: "Poolside House Brunch",
    description: "Daytime pool party brunch — deep house, cocktails, content creators. DJ needed for poolside decks.",
    eventDate: "2026-09-27",
    startTime: "11:00",
    endTime: "16:00",
    location: "Durban",
    venue: "The Oyster Club",
    imageUrl: "https://images.unsplash.com/photo-1516450360452-9312abbf6f7e?w=900&q=80&auto=format&fit=crop",
    businessName: "Oyster Hospitality",
    businessLogoUrl: "https://i.pravatar.cc/100?img=22",
    businessOwnerId: "owner-7",
    artistType: "DJ",
    bookingFee: 3000,
    performanceDuration: 120,
    status: "DRAFTED",
    aboutHost: "Coastal hospitality group — beach clubs, rooftops and boutique hotels.",
    createdAt: "2026-08-26",
  },
  {
    id: "evt-8",
    title: "Jazz & Wine Evening",
    description: "Upmarket jazz evening — trio or solo instrumental, cocktail reception. Elegant, refined, warm.",
    eventDate: "2026-10-02",
    startTime: "18:30",
    endTime: "22:00",
    location: "Sandton",
    venue: "The Saxon",
    imageUrl: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=900&q=80&auto=format&fit=crop",
    businessName: "Saxon Events",
    businessLogoUrl: "https://i.pravatar.cc/100?img=11",
    businessOwnerId: "owner-8",
    artistType: "MUSICIAN",
    bookingFee: 4500,
    performanceDuration: 90,
    status: "DRAFTED",
    aboutHost: "Luxury events — private, corporate and high-profile hospitality.",
    createdAt: "2026-08-27",
  },
];

// ─── Mock Booked Events (for schedule/booked) ─────────────────────────────
const mockBookedEventIds = ["evt-1", "evt-3"]; // artist has 2 confirmed for demo

// ─── Persistence helpers ───────────────────────────────────────────────────
function loadBookings(): ArtistBooking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ArtistBooking[];
  } catch {}
  // seed with 2 pending/confirmed for demo
  const seeded: ArtistBooking[] = [
    {
      id: "bk-1",
      eventId: "evt-1",
      artistId: mockArtistProfile.id,
      artistName: mockArtistProfile.displayName,
      artistType: mockArtistProfile.artistType,
      artistAvatarUrl: mockArtistProfile.avatarUrl,
      status: "ACCEPTED",
      requestedAt: "2026-08-28T10:00:00Z",
      respondedAt: "2026-08-29T09:00:00Z",
      bookingFee: 2500,
      performancesPerDay: 3,
    },
    {
      id: "bk-2",
      eventId: "evt-3",
      artistId: mockArtistProfile.id,
      artistName: mockArtistProfile.displayName,
      artistType: mockArtistProfile.artistType,
      artistAvatarUrl: mockArtistProfile.avatarUrl,
      status: "PENDING",
      requestedAt: "2026-08-30T08:00:00Z",
      bookingFee: 3200,
    },
    // other artists requesting evt-1 for business owner demo
    {
      id: "bk-3",
      eventId: "evt-1",
      artistId: "artist-2",
      artistName: "MCEE Rhyme",
      artistType: "MCEE",
      artistAvatarUrl: "https://i.pravatar.cc/300?img=12",
      status: "PENDING",
      requestedAt: "2026-08-27T14:00:00Z",
      bookingFee: 2000,
      performancesPerDay: 2,
    },
    {
      id: "bk-4",
      eventId: "evt-1",
      artistId: "artist-3",
      artistName: "Thandi Keys",
      artistType: "MUSICIAN",
      artistAvatarUrl: "https://i.pravatar.cc/300?img=32",
      status: "PENDING",
      requestedAt: "2026-08-26T11:00:00Z",
      bookingFee: 3200,
      performancesPerDay: 1,
    },
  ];
  try {
    window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(seeded));
  } catch {}
  return seeded;
}

function saveBookings(bookings: ArtistBooking[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    window.dispatchEvent(new CustomEvent("king-sparkon:artist-bookings", { detail: bookings }));
  } catch {}
}

function loadArtistProfile(): ArtistProfile {
  if (typeof window === "undefined") return mockArtistProfile;
  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ArtistProfile;
  } catch {}
  return mockArtistProfile;
}

function saveArtistProfile(profile: ArtistProfile) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  } catch {}
}

// ─── Public API ────────────────────────────────────────────────────────────
export function getArtistProfile(): ArtistProfile {
  return loadArtistProfile();
}

export function updateArtistProfile(patch: Partial<ArtistProfile>): ArtistProfile {
  const current = loadArtistProfile();
  const next = { ...current, ...patch };
  saveArtistProfile(next);
  return next;
}

export function getArtistById(id: string): ArtistProfile | undefined {
  if (id === mockArtistProfile.id) return loadArtistProfile();
  return mockArtists.find((a) => a.id === id);
}

export function getAllArtists(): ArtistProfile[] {
  return [loadArtistProfile(), ...mockArtists.filter((a) => a.id !== loadArtistProfile().id)];
}

export function getDraftedEvents(): DraftedEvent[] {
  return mockDraftedEvents;
}

export function getDraftedEventById(id: string): DraftedEvent | undefined {
  return mockDraftedEvents.find((e) => e.id === id);
}

export function getBookingsForEvent(eventId: string): ArtistBooking[] {
  return loadBookings().filter((b) => b.eventId === eventId);
}

export function getBookingsForArtist(artistId: string = mockArtistProfile.id): ArtistBooking[] {
  return loadBookings().filter((b) => b.artistId === artistId);
}

export function getBookedEventsForArtist(artistId: string = mockArtistProfile.id): Array<DraftedEvent & { booking: ArtistBooking }> {
  const bookings = loadBookings().filter((b) => b.artistId === artistId && (b.status === "ACCEPTED" || b.status === "CONFIRMED"));
  return bookings
    .map((b) => {
      const ev = getDraftedEventById(b.eventId);
      return ev ? { ...ev, booking: b } : null;
    })
    .filter((x): x is DraftedEvent & { booking: ArtistBooking } => Boolean(x));
}

export function getUpcomingPerformances(artistId: string = mockArtistProfile.id): Array<DraftedEvent & { booking: ArtistBooking }> {
  return getBookedEventsForArtist(artistId)
    .filter((e) => new Date(e.eventDate) >= new Date(new Date().toDateString()))
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
}

export function getRequestStatus(eventId: string, artistId: string = mockArtistProfile.id): ArtistBookingStatus | null {
  const b = loadBookings().find((x) => x.eventId === eventId && x.artistId === artistId);
  return b ? b.status : null;
}

export function requestToPerform(eventId: string, artistId: string = mockArtistProfile.id): ArtistBooking {
  const bookings = loadBookings();
  const existing = bookings.find((b) => b.eventId === eventId && b.artistId === artistId);
  if (existing) return existing;
  const profile = getArtistById(artistId) ?? mockArtistProfile;
  const ev = getDraftedEventById(eventId);
  const newBooking: ArtistBooking = {
    id: `bk-${Date.now()}`,
    eventId,
    artistId,
    artistName: profile.displayName,
    artistType: profile.artistType,
    artistAvatarUrl: profile.avatarUrl,
    status: "PENDING",
    requestedAt: new Date().toISOString(),
    bookingFee: ev?.bookingFee ?? profile.minimumBookingFee,
    performancesPerDay: profile.performancesPerDay,
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
  const bookings = loadBookings().filter((b) => b.artistId === profile.id);
  const upcoming = bookings.filter((b) => b.status === "ACCEPTED" || b.status === "CONFIRMED").length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;
  const thisMonth = getUpcomingPerformances(profile.id).length;
  return { upcomingBookings: upcoming, pendingRequests: pending, thisMonthPerformances: thisMonth || 8, minimumFee: profile.minimumBookingFee };
}

export function getScheduleMap(): Record<string, Array<DraftedEvent & { booking: ArtistBooking }>> {
  const booked = getBookedEventsForArtist();
  const map: Record<string, Array<DraftedEvent & { booking: ArtistBooking }>> = {};
  for (const ev of booked) {
    if (!map[ev.eventDate]) map[ev.eventDate] = [];
    map[ev.eventDate].push(ev);
  }
  return map;
}

export { formatZAR, mockArtistProfile, mockArtists, mockDraftedEvents, mockBookedEventIds };
