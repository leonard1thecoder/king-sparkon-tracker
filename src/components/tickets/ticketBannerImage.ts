import type { TicketEvent } from "@/types/tickets";

type TicketEventWithPoster = TicketEvent & { posterPhotoUrl?: string | null };

export function getTicketBannerImage(event: TicketEventWithPoster) {
  return event.bannerUrl ?? event.posterPhotoUrl ?? "";
}
