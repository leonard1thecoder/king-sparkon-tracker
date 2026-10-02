import { apiClient } from "@/lib/api/client";
import type {
  ArtistBalance,
  ArtistWithdrawal,
  CompleteDraftResult,
  EventSet,
  EventSetBooking,
  EventSetStatus,
  EventSetType,
  SetApplication,
} from "@/types/tickets";
export type CreateEventSetPayload = {
  name: string;
  setType: EventSetType;
  startTime: string;
  endTime: string;
  price?: number | null;
};

export type UpdateEventSetPayload = {
  name?: string;
  startTime?: string;
  endTime?: string;
  price?: number | null;
  status?: EventSetStatus;
};

export type VowResult = {
  applicationId: string;
  vowCount: number;
  topVowCount: number;
  isTop: boolean;
};

function validateSetPayload(payload: CreateEventSetPayload) {
  if (!payload.name.trim()) throw new Error("Set name is required.");
  if (!payload.startTime) throw new Error("Set start time is required.");
  if (!payload.endTime) throw new Error("Set end time is required.");
  if (payload.startTime >= payload.endTime) throw new Error("Set start time must be before end time.");
  if (payload.setType === "VOW" && !(Number(payload.price) > 0)) {
    throw new Error("Vow sets need a set price for the winning artist.");
  }
  if (payload.price != null && Number(payload.price) < 0) throw new Error("Set price cannot be negative.");
}

export async function listEventSets(eventId: string) {
  const { data } = await apiClient.get<EventSet[]>(`/v1/tickets/events/${eventId}/sets`);
  return Array.isArray(data) ? data : [];
}

export async function listOpenSets() {
  const { data } = await apiClient.get<EventSet[]>(`/v1/tickets/sets/open`);
  return Array.isArray(data) ? data : [];
}

export async function createEventSet(eventId: string, payload: CreateEventSetPayload) {
  validateSetPayload(payload);
  const { data } = await apiClient.post<EventSet>(`/v1/tickets/events/${eventId}/sets`, payload);
  return data;
}

export async function updateEventSet(setId: string, payload: UpdateEventSetPayload) {
  const { data } = await apiClient.patch<EventSet>(`/v1/tickets/sets/${setId}`, payload);
  return data;
}

export async function cancelEventSet(setId: string) {
  return updateEventSet(setId, { status: "CANCELLED" });
}

export async function applyToSet(setId: string) {
  const { data } = await apiClient.post<SetApplication>(`/v1/tickets/sets/${setId}/apply`);
  return data;
}

export async function listSetApplications(setId: string) {
  const { data } = await apiClient.get<SetApplication[]>(`/v1/tickets/sets/${setId}/applications`);
  return Array.isArray(data) ? data : [];
}

export async function listBookings(setId: string) {
  const { data } = await apiClient.get<EventSetBooking[]>(`/v1/tickets/sets/${setId}/bookings`);
  return Array.isArray(data) ? data : [];
}

export async function rejectSetApplication(setId: string, applicationId: string) {
  const { data } = await apiClient.post<SetApplication>(`/v1/tickets/sets/${setId}/applications/${applicationId}/reject`);
  return data;
}

export async function listMySetApplications() {
  const { data } = await apiClient.get<SetApplication[]>(`/v1/tickets/sets/applications/me`);
  return Array.isArray(data) ? data : [];
}

export async function vowForArtist(setId: string, applicationId: string) {
  const { data } = await apiClient.post<VowResult>(`/v1/tickets/sets/${setId}/vows`, { applicationId });
  return data;
}

export async function bookSetWinner(setId: string) {
  const { data } = await apiClient.post<EventSetBooking>(`/v1/tickets/sets/${setId}/book-winner`);
  return data;
}

export async function bookSetArtist(setId: string, artistId: number, offerAmount: number) {
  if (!(offerAmount > 0)) throw new Error("Offer amount must be greater than zero.");
  const { data } = await apiClient.post<EventSetBooking>(`/v1/tickets/sets/${setId}/book-artist`, { artistId, offerAmount });
  return data;
}

export async function listMySetBookings() {
  const { data } = await apiClient.get<EventSetBooking[]>(`/v1/tickets/set-bookings/me`);
  return Array.isArray(data) ? data : [];
}

export async function respondToSetBooking(bookingId: string, accept: boolean) {
  const { data } = await apiClient.post<EventSetBooking>(`/v1/tickets/set-bookings/${bookingId}/${accept ? "accept" : "reject"}`);
  return data;
}

export async function cancelSetBooking(bookingId: string) {
  const { data } = await apiClient.post<EventSetBooking>(`/v1/tickets/set-bookings/${bookingId}/cancel`);
  return data;
}

export async function completeDraft(eventId: string) {
  const { data } = await apiClient.post<CompleteDraftResult>(`/v1/tickets/events/${eventId}/complete-draft`);
  return data;
}

export async function getArtistBalance() {
  const { data } = await apiClient.get<ArtistBalance>(`/artist/earnings/balance`);
  return data;
}

export async function listArtistWithdrawals() {
  const { data } = await apiClient.get<ArtistWithdrawal[]>(`/artist/withdrawals`);
  return Array.isArray(data) ? data : [];
}

export async function requestArtistWithdrawal(payload: { businessId: number; amount: number; paypalEmail?: string }) {
  if (!(payload.amount > 0)) throw new Error("Amount must be greater than zero.");
  const { data } = await apiClient.post<ArtistWithdrawal>(`/artist/withdrawals`, payload);
  return data;
}

export async function listPendingArtistWithdrawals() {
  const { data } = await apiClient.get<ArtistWithdrawal[]>(`/owner/artist/withdrawals/pending`);
  return Array.isArray(data) ? data : [];
}

export async function decideArtistWithdrawal(withdrawalId: number, decision: "approve" | "reject" | "mark-paid") {
  const { data } = await apiClient.post<ArtistWithdrawal>(`/owner/artist/withdrawals/${withdrawalId}/${decision}`);
  return data;
}
