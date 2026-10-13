import type { TicketEvent } from "@/types/tickets";
import type { Product } from "@/lib/types/backend";
import type { PublicJob } from "@/lib/public/data";

/*
 * Sample data for the public site (Events, Mall, Job Posts).
 *
 * Shown only when the backend returns no published items, so visitors can
 * explore the layout. Every demo id is prefixed with "demo-" and pages
 * render a "Sample data" badge whenever demo content is displayed.
 */

function futureDate(daysAhead: number) {
  const date = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const nowIso = () => new Date().toISOString();

export function isDemoId(id: string | number | null | undefined) {
  return typeof id === "string" ? id.startsWith("demo-") : false;
}

export function isDemoProductId(id: number | null | undefined) {
  if (typeof id !== "number") return false;
  return demoProducts().some((product) => product.id === id);
}

export function isDemoJobId(id: number | null | undefined) {
  if (typeof id !== "number") return false;
  return demoJobs().some((job) => job.id === id);
}

export function demoEvents(): TicketEvent[] {
  const createdAt = nowIso();
  return [
    {
      id: "demo-event-summer-festival",
      ownerId: "demo-owner-1",
      businessId: 1,
      name: "Summer Beats Festival",
      description:
        "A full day of live music, food stalls and local crafts. Three stages, twenty artists, and a sunset headline set on the main stage.",
      location: "Johannesburg",
      eventDate: futureDate(21),
      eventTime: "12:00",
      eventEndTime: "23:00",
      status: "PUBLISHED",
      ticketTypes: [
        { id: "demo-event-summer-festival-regular", eventId: "demo-event-summer-festival", type: "REGULAR", price: 250, capacity: 500, sold: 187, available: 313 },
        { id: "demo-event-summer-festival-vip", eventId: "demo-event-summer-festival", type: "VIP", price: 650, capacity: 120, sold: 41, available: 79 },
        { id: "demo-event-summer-festival-vvip", eventId: "demo-event-summer-festival", type: "VVIP", price: 1200, capacity: 40, sold: 12, available: 28 },
      ],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "demo-event-ama-piano-night",
      ownerId: "demo-owner-2",
      businessId: 2,
      name: "Amapiano All Night",
      description:
        "The city's finest amapiano DJs take over the warehouse floor until late. Doors open at 8pm, strictly no under 18s.",
      location: "Pretoria",
      eventDate: futureDate(14),
      eventTime: "20:00",
      eventEndTime: "04:00",
      status: "PUBLISHED",
      ticketTypes: [
        { id: "demo-event-ama-piano-night-regular", eventId: "demo-event-ama-piano-night", type: "REGULAR", price: 150, capacity: 300, sold: 96, available: 204 },
        { id: "demo-event-ama-piano-night-vip", eventId: "demo-event-ama-piano-night", type: "VIP", price: 350, capacity: 60, sold: 22, available: 38 },
      ],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "demo-event-food-market",
      ownerId: "demo-owner-3",
      businessId: 3,
      name: "Neighbourgoods Food Market",
      description:
        "Forty local vendors, craft drinks, live acoustic sets and a kids' corner. Free entry before 11am, tickets after.",
      location: "Cape Town",
      eventDate: futureDate(9),
      eventTime: "09:00",
      eventEndTime: "15:00",
      status: "PUBLISHED",
      ticketTypes: [
        { id: "demo-event-food-market-regular", eventId: "demo-event-food-market", type: "REGULAR", price: 50, capacity: 1000, sold: 402, available: 598 },
      ],
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: "demo-event-comedy-friday",
      ownerId: "demo-owner-1",
      businessId: 1,
      name: "Friday Comedy Underground",
      description:
        "Five stand-up acts plus a surprise headliner, hosted in the basement theatre. Bar opens at 6pm, show starts at 8pm sharp.",
      location: "Durban",
      eventDate: futureDate(5),
      eventTime: "20:00",
      eventEndTime: "23:00",
      status: "PUBLISHED",
      ticketTypes: [
        { id: "demo-event-comedy-friday-regular", eventId: "demo-event-comedy-friday", type: "REGULAR", price: 120, capacity: 150, sold: 88, available: 62 },
        { id: "demo-event-comedy-friday-vip", eventId: "demo-event-comedy-friday", type: "VIP", price: 280, capacity: 30, sold: 9, available: 21 },
      ],
      createdAt,
      updatedAt: createdAt,
    },
  ];
}

export function getDemoEventById(id: string): TicketEvent | null {
  return demoEvents().find((event) => event.id === id) ?? null;
}

export function demoProducts(): Product[] {
  return [
    { id: 1001, businessId: 1, businessName: "Ubuntu General Store", name: "Still Water 750ml", category: "NonAlcohol", status: "CREATED", price: 18.5, salePrice: 15, stockQuantity: 120, productImageUrl: null, pickupEnabled: true, deliveryEnabled: true, deliveryFee: 10, deliveryLeadTimeMinutes: 30 },
    { id: 1002, businessId: 1, businessName: "Ubuntu General Store", name: "Castle Lite 330ml", category: "Alcohol", status: "CREATED", price: 22, stockQuantity: 200, productImageUrl: null, pickupEnabled: true, deliveryEnabled: true, deliveryFee: 10, deliveryLeadTimeMinutes: 30 },
    { id: 1003, businessId: 2, businessName: "Bra Tuck Corner", name: "Chicken Mayo Kota", category: "Food", status: "CREATED", price: 45, salePrice: 39.99, stockQuantity: 60, productImageUrl: null, pickupEnabled: true, deliveryEnabled: true, deliveryFee: 15, deliveryLeadTimeMinutes: 45 },
    { id: 1004, businessId: 2, businessName: "Bra Tuck Corner", name: "Beef Vetkoek", category: "Food", status: "CREATED", price: 28, stockQuantity: 80, productImageUrl: null, pickupEnabled: true, deliveryEnabled: false },
    { id: 1005, businessId: 3, businessName: "Cape Craft Drinks", name: "Craft Ginger Beer 500ml", category: "NonAlcohol", status: "CREATED", price: 35, stockQuantity: 150, productImageUrl: null, pickupEnabled: true, deliveryEnabled: true, deliveryFee: 12, deliveryLeadTimeMinutes: 60 },
    { id: 1006, businessId: 3, businessName: "Cape Craft Drinks", name: "Local Lager Six Pack", category: "Alcohol", status: "CREATED", price: 129.99, salePrice: 109.99, stockQuantity: 90, productImageUrl: null, pickupEnabled: true, deliveryEnabled: true, deliveryFee: 20, deliveryLeadTimeMinutes: 60 },
    { id: 1007, businessId: 1, businessName: "Ubuntu General Store", name: "Biltong 100g", category: "Snacks", status: "CREATED", price: 65, stockQuantity: 75, productImageUrl: null, pickupEnabled: true, deliveryEnabled: true, deliveryFee: 10, deliveryLeadTimeMinutes: 30 },
    { id: 1008, businessId: 2, businessName: "Bra Tuck Corner", name: "Event Coolerbox Hire", category: "Services", status: "CREATED", price: 150, stockQuantity: 12, productImageUrl: null, pickupEnabled: false, deliveryEnabled: true, deliveryFee: 50, deliveryLeadTimeMinutes: 120 },
  ];
}

export function getDemoProductById(id: number): Product | null {
  return demoProducts().find((product) => product.id === id) ?? null;
}

export function demoJobs(): PublicJob[] {
  return [
    { id: 2001, title: "Cashier — Weekend Shifts", companyName: "Ubuntu General Store", location: "Johannesburg", status: "OPEN", description: "Friendly cashier for busy weekend shifts. Must be comfortable with card machines, cash-ups and greeting regulars by name. Retail experience an advantage but attitude matters most." },
    { id: 2002, title: "Delivery Driver (Own Bike)", companyName: "Bra Tuck Corner", location: "Pretoria", status: "OPEN", description: "Deliver kota orders around the neighbourhood. Own motorbike and valid licence required, fuel allowance plus per-delivery bonus paid weekly." },
    { id: 2003, title: "Barista — Morning Rush", companyName: "Cape Craft Drinks", location: "Cape Town", status: "OPEN", description: "Early-morning barista for our harbour kiosk. Latte art skills welcome. Shifts run 6am to 12pm, Monday to Saturday." },
    { id: 2004, title: "Junior Graphic Designer", companyName: "Sparkon Media", location: "Remote", status: "OPEN", description: "Design event posters, social cards and menus for township businesses. Portfolio of three pieces required. Remote-first with monthly meetups in Joburg." },
    { id: 2005, title: "Security Guard — Night Events", companyName: "SafeGate Events", location: "Durban", status: "OPEN", description: "PSIRA-registered guards for weekend music events. Must be firm, friendly and sober on duty. Transport home after midnight events included." },
    { id: 2006, title: "Kitchen Assistant", companyName: "Bra Tuck Corner", location: "Pretoria", status: "OPEN", description: "Prep, packing and cleaning support for our kota kitchen. No experience needed — training provided, meals included, growth into cook roles." },
  ];
}

export function getDemoJobById(id: number): PublicJob | null {
  return demoJobs().find((job) => job.id === id) ?? null;
}
