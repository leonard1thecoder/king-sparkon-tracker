import type { BusinessCatalogItem, FollowResponse, TicketEventComment } from "@/types/tickets";

const DEFAULT_USER_ID = "user-demo-001";

let comments: TicketEventComment[] = [
  {
    id: "comment-demo-001",
    eventId: "event-sparkon-summit",
    userId: DEFAULT_USER_ID,
    displayName: "Sizolwakhe",
    comment: "This event looks perfect for barcode and QR ticket teams.",
    createdAt: new Date().toISOString(),
  },
];

let catalog: BusinessCatalogItem[] = [
  {
    businessId: "owner-demo-001",
    businessName: "King Sparkon Events",
    imagePath: null,
    following: false,
    eventCount: 3,
  },
  {
    businessId: "owner-demo-002",
    businessName: "Barcode Pro Africa",
    imagePath: null,
    following: false,
    eventCount: 1,
  },
];

function delay() {
  return new Promise((resolve) => {
    if (typeof window === "undefined") resolve(undefined);
    else window.setTimeout(resolve, 180);
  });
}

export async function getEventComments(eventId: string) {
  await delay();
  return comments.filter((comment) => comment.eventId === eventId).sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

export async function addEventComment(eventId: string, displayName: string, comment: string) {
  await delay();
  if (!comment.trim()) throw new Error("Comment is required.");
  const created: TicketEventComment = {
    id: `comment-${Date.now()}`,
    eventId,
    userId: DEFAULT_USER_ID,
    displayName: displayName.trim() || "Ticket user",
    comment: comment.trim(),
    createdAt: new Date().toISOString(),
  };
  comments = [created, ...comments];
  return created;
}

export async function getBusinessCatalog() {
  await delay();
  return catalog.map((item) => ({ ...item }));
}

export async function followBusiness(businessId: string): Promise<FollowResponse> {
  await delay();
  catalog = catalog.map((item) => (item.businessId === businessId ? { ...item, following: true } : item));
  return { businessId, userId: DEFAULT_USER_ID, following: true };
}

export async function unfollowBusiness(businessId: string): Promise<FollowResponse> {
  await delay();
  catalog = catalog.map((item) => (item.businessId === businessId ? { ...item, following: false } : item));
  return { businessId, userId: DEFAULT_USER_ID, following: false };
}

export async function createTicketPromotionCheckout(eventId: string) {
  await delay();
  return {
    eventId,
    amount: 1500,
    currency: "ZAR",
    message: "Stripe sandbox promotion checkout is ready. Backend endpoint will charge R1500 and show this event to all users, even users who do not follow the business.",
  };
}
