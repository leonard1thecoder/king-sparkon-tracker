import type { TicketEvent } from "@/types/tickets";

const localMockTicketBanners: Record<string, string> = {
  "event-sparkon-summit-bulk": "/mock/tickets/sparkon-summit.svg",
  "event-soweto-night-market": "/mock/tickets/night-market.svg",
  "event-cape-town-scanfest": "/mock/tickets/scanfest.svg",
  "event-durban-gate-masterclass": "/mock/tickets/training.svg",
  "event-pretoria-business-expo": "/mock/tickets/owner-expo.svg",
  "event-mamelodi-tuckshop-festival": "/mock/tickets/festival.svg",
  "event-sandton-founder-night": "/mock/tickets/premium-night.svg",
  "event-limpopo-scanner-roadshow": "/mock/tickets/roadshow.svg",
  "event-bloemfontein-qa-conference": "/mock/tickets/scanfest.svg",
  "event-east-london-cloud-night": "/mock/tickets/owner-expo.svg",
  "event-sold-out-vvip-preview": "/mock/tickets/premium-night.svg",
  "event-completed-history-preview": "/mock/tickets/sparkon-summit.svg",
  "event-cancelled-weather-preview": "/mock/tickets/roadshow.svg",
};

type TicketEventWithPoster = TicketEvent & { posterPhotoUrl?: string | null };

export function getTicketBannerImage(event: TicketEventWithPoster) {
  return localMockTicketBanners[event.id] ?? event.bannerUrl ?? event.posterPhotoUrl ?? "";
}
