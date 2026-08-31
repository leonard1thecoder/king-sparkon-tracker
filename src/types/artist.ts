export type ArtistType = "DJ" | "MUSICIAN" | "MCEE";
export type ArtistBookingStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CONFIRMED";
export type DraftedEventStatus = "DRAFTED" | "OPEN" | "BOOKED";

export interface ArtistProfile {
  id: string;
  username: string;
  displayName: string;
  artistType: ArtistType;
  performancesPerDay: number;
  minimumBookingFee: number;
  bio: string;
  avatarUrl: string;
  coverUrl: string;
  location: string;
  socialLinks: { instagram?: string; facebook?: string; tiktok?: string };
  verified?: boolean;
}

export interface DraftedEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location: string;
  venue: string;
  imageUrl: string;
  businessName: string;
  businessLogoUrl?: string;
  businessOwnerId: string;
  artistType: ArtistType;
  bookingFee: number;
  performanceDuration: number; // minutes
  status: DraftedEventStatus;
  aboutHost?: string;
  createdAt: string;
}

export interface ArtistBooking {
  id: string;
  eventId: string;
  artistId: string;
  artistName: string;
  artistType: ArtistType;
  artistAvatarUrl?: string;
  status: ArtistBookingStatus;
  requestedAt: string;
  respondedAt?: string;
  bookingFee: number;
  performancesPerDay?: number;
}

export interface ArtistDashboardStats {
  upcomingBookings: number;
  upcomingDelta: number;
  pendingRequests: number;
  thisMonthPerformances: number;
  minimumFee: number;
}

export interface ArtistEventRequest {
  eventId: string;
  status: ArtistBookingStatus;
  requestedAt: string;
}
