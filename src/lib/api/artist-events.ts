import { apiGet, apiPost, apiPostIdempotent, apiPut } from "@/lib/api/client";
import { createIdempotencyKey } from "@/lib/api/contracts";
import type {
  ArtistBookingStatusResponse,
  BackendArtistEvent,
  CreateArtistEventPayload,
  EventRiderSummary,
  RiderRedemption,
  RiderStatus,
  UpdateArtistEventPayload,
} from "@/lib/types/backend";

// Owner drafted events — backend: POST/PUT/GET /owner/artist/events,
// POST /events/{id}/publish, GET /events/{eventId}/rider.
export function createOwnerArtistEvent(payload: CreateArtistEventPayload) {
  return apiPost<BackendArtistEvent, CreateArtistEventPayload>("/owner/artist/events", payload);
}

export function updateOwnerArtistEvent(eventId: string, payload: UpdateArtistEventPayload) {
  return apiPut<BackendArtistEvent, UpdateArtistEventPayload>(
    `/owner/artist/events/${encodeURIComponent(eventId)}`,
    payload,
  );
}

export function listOwnerArtistEvents() {
  return apiGet<BackendArtistEvent[]>("/owner/artist/events");
}

export function publishOwnerArtistEvent(eventId: string) {
  return apiPost<BackendArtistEvent>(`/owner/artist/events/${encodeURIComponent(eventId)}/publish`);
}

export function getOwnerEventRider(eventId: string) {
  return apiGet<EventRiderSummary>(`/owner/artist/events/${encodeURIComponent(eventId)}/rider`);
}

// Artist booking for an event — backend: GET /artist/bookings/event/{id}/status,
// POST /artist/events/{id}/request.
export function getArtistEventBookingStatus(eventId: string) {
  return apiGet<ArtistBookingStatusResponse | null>(`/artist/bookings/event/${encodeURIComponent(eventId)}/status`);
}

export function requestArtistEventBooking(eventId: string) {
  return apiPost(`/artist/events/${encodeURIComponent(eventId)}/request`);
}

// Artist event + rider — backend: GET /artist/events/{id},
// GET /artist/events/{id}/rider, POST /artist/events/{id}/rider/redeem.
export function getArtistEvent(eventId: string) {
  return apiGet<BackendArtistEvent>(`/artist/events/${encodeURIComponent(eventId)}`);
}

export function getArtistEventRider(eventId: string) {
  return apiGet<RiderStatus>(`/artist/events/${encodeURIComponent(eventId)}/rider`);
}

export function redeemArtistEventRider(
  eventId: string,
  payload: { productId: number; quantity: number },
  idempotencyKey = createIdempotencyKey("artist-rider-redeem"),
) {
  return apiPostIdempotent<RiderRedemption, typeof payload>(
    `/artist/events/${encodeURIComponent(eventId)}/rider/redeem`,
    payload,
    idempotencyKey,
  );
}
