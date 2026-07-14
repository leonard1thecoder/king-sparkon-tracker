import { apiClient, apiGet } from "@/lib/api/client";

export type AffiliatePosterCategory = "TICKETS" | "PRODUCTS" | "TIPS" | "JOB_OPPORTUNITIES";

export type AffiliatePoster = {
  id: number;
  category: AffiliatePosterCategory;
  title: string;
  description?: string | null;
  imageUrl: string;
  active: boolean;
  createdBy?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export function listAffiliatePosters() {
  return apiGet<AffiliatePoster[]>("/affiliates/assets");
}

export function listAdminAffiliatePosters() {
  return apiGet<AffiliatePoster[]>("/admin/affiliate-posters");
}

export async function uploadAffiliatePoster(payload: {
  category: AffiliatePosterCategory;
  title: string;
  description?: string;
  file: File;
}) {
  const formData = new FormData();
  formData.set("category", payload.category);
  formData.set("title", payload.title);
  formData.set("description", payload.description ?? "");
  formData.set("file", payload.file);
  const response = await apiClient.post<AffiliatePoster>("/admin/affiliate-posters", formData);
  return response.data;
}

export async function deactivateAffiliatePoster(id: number) {
  await apiClient.delete(`/admin/affiliate-posters/${id}`);
}
