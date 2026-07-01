import axios from "axios";
import type {
  ApplyForJobPayload,
  CreateJobOpportunityPayload,
  JobApplication,
  JobApplicationStatus,
  JobOpportunity,
  PageResponse,
} from "@/lib/types/backend";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL ?? "",
  withCredentials: true,
});

type ListJobsParams = {
  keyword?: string;
  location?: string;
  workplaceType?: string;
  employmentType?: string;
  experienceLevel?: string;
  status?: string;
  page?: number;
  size?: number;
};

function normalizePage<T>(data: PageResponse<T> | T[] | undefined): PageResponse<T> {
  if (Array.isArray(data)) return { content: data, page: 0, size: data.length, totalElements: data.length, totalPages: 1 };
  return data ?? { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 };
}

export async function getPublicJobs(params: ListJobsParams = {}) {
  const { data } = await api.get<PageResponse<JobOpportunity> | JobOpportunity[]>("/api/v1/job-opportunities/public", { params });
  return normalizePage(data);
}

export async function getJobById(id: number | string) {
  const { data } = await api.get<JobOpportunity>(`/api/v1/job-opportunities/${id}`);
  return data;
}

export async function getManagedJobs(params: ListJobsParams = {}) {
  const { data } = await api.get<PageResponse<JobOpportunity> | JobOpportunity[]>("/api/v1/job-opportunities/manage", { params });
  return normalizePage(data);
}

export async function createJobOpportunity(payload: CreateJobOpportunityPayload) {
  const { data } = await api.post<JobOpportunity>("/api/v1/job-opportunities", payload);
  return data;
}

export async function updateJobOpportunity(id: number | string, payload: Partial<CreateJobOpportunityPayload>) {
  const { data } = await api.put<JobOpportunity>(`/api/v1/job-opportunities/${id}`, payload);
  return data;
}

export async function publishJobOpportunity(id: number | string) {
  const { data } = await api.patch<JobOpportunity>(`/api/v1/job-opportunities/${id}/publish`);
  return data;
}

export async function closeJobOpportunity(id: number | string) {
  const { data } = await api.patch<JobOpportunity>(`/api/v1/job-opportunities/${id}/close`);
  return data;
}

export async function archiveJobOpportunity(id: number | string) {
  const { data } = await api.patch<JobOpportunity>(`/api/v1/job-opportunities/${id}/archive`);
  return data;
}

export async function applyForJob(id: number | string, payload: ApplyForJobPayload) {
  const { data } = await api.post<JobApplication>(`/api/v1/job-opportunities/${id}/applications`, payload);
  return data;
}

export async function getMyJobApplications() {
  const { data } = await api.get<PageResponse<JobApplication> | JobApplication[]>("/api/v1/job-opportunities/applications/me");
  return normalizePage(data);
}

export async function getJobApplications(jobId: number | string) {
  const { data } = await api.get<PageResponse<JobApplication> | JobApplication[]>(`/api/v1/job-opportunities/${jobId}/applications`);
  return normalizePage(data);
}

export async function updateJobApplicationStatus(applicationId: number | string, status: JobApplicationStatus) {
  const { data } = await api.patch<JobApplication>(`/api/v1/job-opportunities/applications/${applicationId}/status`, { status });
  return data;
}
