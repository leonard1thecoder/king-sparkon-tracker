import { apiGet } from "./client";

// User dashboard worker discovery (king-sparkon-tracker-backend):
// - GET /api/user-dashboard/businesses                    -> businesses visible to the user
// - GET /api/user-dashboard/businesses/{businessId}/workers -> workers for tips
//   (WorkerTipCardResponse: workerId, username, emailAddress, jobTitle,
//   profilePictureUrl, tipQrCodeEnabled, tipQrCodeUrl)

export type UserBusinessCard = {
  businessId: number;
  businessName: string;
  description?: string | null;
  qrCodeUrl?: string | null;
  ownerId?: number | null;
  ownerUsername?: string | null;
  ownerProfilePictureUrl?: string | null;
};

export type WorkerTipCard = {
  workerId: number;
  username: string;
  emailAddress?: string | null;
  jobTitle?: string | null;
  profilePictureUrl?: string | null;
  tipQrCodeEnabled: boolean;
  tipQrCodeUrl?: string | null;
};

export function listUserBusinesses() {
  return apiGet<UserBusinessCard[]>("/user-dashboard/businesses");
}

export function listBusinessWorkers(businessId: number) {
  return apiGet<WorkerTipCard[]>(`/user-dashboard/businesses/${businessId}/workers`);
}
