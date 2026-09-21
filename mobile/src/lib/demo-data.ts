import type { MobileJob, UserBusiness, WorkerTipCard } from "./api";
import type { Product, TicketEvent } from "./types";

// Demo listings for the guest (public) tabs so they can be tested
// without a reachable backend. Screens fall back to these only when
// the API call fails; live data always wins when it loads.

export const DEMO_NOTICE = "Demo preview — connect to the backend for live data.";

export function demoBusinesses(): UserBusiness[] {
  return [
    { businessId: 1, businessName: "Sparkon Tuck Shop", description: "Everyday groceries and kota." },
    { businessId: 2, businessName: "Jozi Events & Co", description: "Live shows and community events." },
  ];
}

export function demoProducts(search?: string): Product[] {
  const all: Product[] = [
    { id: 101, businessId: 1, businessName: "Sparkon Tuck Shop", name: "Kota Special", category: "Food", price: 45, stockQuantity: 20 },
    { id: 102, businessId: 1, businessName: "Sparkon Tuck Shop", name: "Simba Chips 120g", category: "Snacks", price: 22.5, stockQuantity: 48 },
    { id: 103, businessId: 1, businessName: "Sparkon Tuck Shop", name: "Coca-Cola 2L", category: "Drinks", price: 32, stockQuantity: 36 },
    { id: 104, businessId: 1, businessName: "Sparkon Tuck Shop", name: "White Bread", category: "Bakery", price: 18, stockQuantity: 15 },
    { id: 105, businessId: 1, businessName: "Sparkon Tuck Shop", name: "Vetkoek & Mince", category: "Food", price: 25, stockQuantity: 12 },
    { id: 106, businessId: 1, businessName: "Sparkon Tuck Shop", name: "Airtime Voucher R30", category: "Airtime", price: 30, stockQuantity: 100 },
  ];
  const needle = (search ?? "").trim().toLowerCase();
  if (!needle) return all;
  return all.filter(
    (item) =>
      item.name.toLowerCase().includes(needle) || item.category.toLowerCase().includes(needle),
  );
}

export function demoEvents(): TicketEvent[] {
  return [
    {
      id: "demo-event-1",
      name: "Amapiano Night Live",
      venue: "Orlando Community Hall",
      eventDate: "2026-10-31",
      eventTime: "19:00",
      status: "PUBLISHED",
      ticketTypes: [
        { type: "General", price: 150, capacity: 500, sold: 128, available: 372 },
        { type: "VIP", price: 450, capacity: 80, sold: 21, available: 59 },
      ],
    },
    {
      id: "demo-event-2",
      name: "Community Soccer Final",
      venue: "Dobsonville Stadium",
      eventDate: "2026-11-14",
      eventTime: "15:00",
      status: "PUBLISHED",
      ticketTypes: [{ type: "Grandstand", price: 80, capacity: 1000, sold: 340, available: 660 }],
    },
  ];
}

export function demoJobs(keyword?: string): MobileJob[] {
  const all: MobileJob[] = [
    {
      id: 201,
      title: "Cashier",
      businessName: "Sparkon Tuck Shop",
      location: "Soweto, JHB",
      status: "OPEN",
      jobDescription: "Serve customers at the till, handle cash and card payments.",
    },
    {
      id: 202,
      title: "Delivery Driver",
      businessName: "Sparkon Tuck Shop",
      location: "Soweto, JHB",
      status: "OPEN",
      jobDescription: "Deliver online orders within a 10km radius. Requires a valid licence.",
    },
    {
      id: 203,
      title: "Social Media Assistant",
      businessName: "Jozi Events & Co",
      location: "Remote",
      status: "OPEN",
      jobDescription: "Promote upcoming shows on WhatsApp, TikTok and Facebook.",
    },
  ];
  const needle = (keyword ?? "").trim().toLowerCase();
  if (!needle) return all;
  return all.filter(
    (job) =>
      job.title.toLowerCase().includes(needle) ||
      (job.businessName ?? "").toLowerCase().includes(needle) ||
      (job.location ?? "").toLowerCase().includes(needle),
  );
}

export function demoWorkers(businessId?: number | null, query?: string): WorkerTipCard[] {
  const all: WorkerTipCard[] = [
    { workerId: 301, username: "Lerato", jobTitle: "Cashier", businessId: 1, businessName: "Sparkon Tuck Shop", tipQrCodeEnabled: true },
    { workerId: 302, username: "Sipho", jobTitle: "Cook", businessId: 1, businessName: "Sparkon Tuck Shop", tipQrCodeEnabled: true },
    { workerId: 303, username: "Naledi", jobTitle: "Usher", businessId: 2, businessName: "Jozi Events & Co", tipQrCodeEnabled: true },
  ];
  const scoped = businessId === null || businessId === undefined ? all : all.filter((w) => w.businessId === businessId);
  const needle = (query ?? "").trim().toLowerCase();
  if (!needle) return scoped;
  return scoped.filter(
    (w) => w.username.toLowerCase().includes(needle) || (w.jobTitle ?? "").toLowerCase().includes(needle),
  );
}
