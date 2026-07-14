import { apiDelete, apiGet, apiPatch, apiPost } from "./client";

export function getOwnerProfile() {
  return apiGet("/users/me");
}

export function listWorkers() {
  return apiGet("/users");
}

export function createWorker(payload: Record<string, unknown>) {
  return apiPost("/users/workers", payload);
}

export function deleteWorker(workerId: number) {
  return apiDelete(`/users/workers/${workerId}`);
}

export function completeOwnerOnboarding(payload: Record<string, unknown>) {
  return apiPatch("/users/me/onboarding", payload);
}
