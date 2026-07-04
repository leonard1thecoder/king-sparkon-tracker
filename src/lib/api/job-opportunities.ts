import { apiClient } from "@/lib/api/client";
import type {
  ApplyForJobPayload,
  CreateJobOpportunityPayload,
  JobApplication,
  JobApplicationStatus,
  JobOpportunity,
  PageResponse,
} from "@/lib/types/backend";

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

type BackendJobPost = {
  id: number;
  businessId?: number | null;
  businessName?: string | null;
  title: string;
  startingDate?: string | null;
  closingDate?: string | null;
  jobDescription?: string | null;
  yearsOfExperienceRequired?: string | null;
  jobPostFileUrl?: string | null;
  estimatedSalary?: number | string | null;
  currency?: string | null;
  status?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
};

type BackendJobApplication = {
  id: number;
  jobPost?: BackendJobPost | null;
  applicantId?: number | null;
  applicantUsername?: string | null;
  applicantEmail?: string | null;
  profile?: {
    fullName?: string | null;
    phoneNumber?: string | null;
    about?: string | null;
  } | null;
  status?: JobApplicationStatus | null;
  resumeUrl?: string | null;
  createdDate?: string | null;
  modifiedDate?: string | null;
};

function normalizePage<T>(data: PageResponse<T> | T[] | undefined): PageResponse<T> {
  if (Array.isArray(data)) return { content: data, page: 0, size: data.length, totalElements: data.length, totalPages: 1 };
  return data ?? { content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 };
}

function asNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapExperienceLevel(value: string | null | undefined): JobOpportunity["experienceLevel"] {
  if (value === "LESS_THAN_ONE_YEAR" || value === "ONE_YEAR") return "ENTRY_LEVEL";
  if (value === "TWO_YEARS") return "JUNIOR";
  if (value === "THREE_YEARS" || value === "FOUR_YEARS") return "MID_LEVEL";
  if (value === "FIVE_YEARS") return "SENIOR";
  return "LEAD";
}

function mapStatus(value: string | null | undefined): JobOpportunity["status"] {
  if (value === "CANCELLED") return "ARCHIVED";
  if (value === "DRAFT" || value === "OPEN" || value === "CLOSED" || value === "ARCHIVED") return value;
  return "OPEN";
}

function mapJob(post: BackendJobPost): JobOpportunity {
  const salary = asNumber(post.estimatedSalary);

  return {
    id: post.id,
    title: post.title,
    companyName: post.businessName ?? "King Sparkon business",
    businessId: post.businessId ?? null,
    location: "Business location",
    workplaceType: "ONSITE",
    employmentType: "FULL_TIME",
    experienceLevel: mapExperienceLevel(post.yearsOfExperienceRequired),
    salaryMin: salary,
    salaryMax: salary,
    salaryCurrency: post.currency ?? "ZAR",
    description: post.jobDescription ?? "",
    requirements: post.yearsOfExperienceRequired ? `Experience required: ${post.yearsOfExperienceRequired.replaceAll("_", " ").toLowerCase()}.` : "See job description.",
    applyUrl: post.jobPostFileUrl ?? null,
    status: mapStatus(post.status),
    createdAt: post.createdDate ?? undefined,
    updatedAt: post.modifiedDate ?? undefined,
    publishedAt: post.createdDate ?? null,
    closedAt: post.closingDate ?? null,
  };
}

function mapApplication(application: BackendJobApplication): JobApplication {
  const jobPost = application.jobPost ? mapJob(application.jobPost) : null;

  return {
    id: application.id,
    jobOpportunityId: jobPost?.id,
    jobTitle: jobPost?.title,
    companyName: jobPost?.companyName,
    applicantUserId: application.applicantId ?? undefined,
    applicantName: application.profile?.fullName ?? application.applicantUsername ?? "Applicant",
    applicantEmail: application.applicantEmail ?? "",
    phoneNumber: application.profile?.phoneNumber ?? null,
    coverMessage: application.profile?.about ?? null,
    cvUrl: application.resumeUrl ?? null,
    status: application.status ?? "SUBMITTED",
    createdAt: application.createdDate ?? undefined,
    updatedAt: application.modifiedDate ?? undefined,
  };
}

function toPage<TInput, TOutput>(data: PageResponse<TInput> | TInput[] | undefined, mapper: (item: TInput) => TOutput): PageResponse<TOutput> {
  const page = normalizePage(data);
  return { ...page, content: page.content.map(mapper) };
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function dateAfterDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function toBackendExperienceLevel(value: CreateJobOpportunityPayload["experienceLevel"]) {
  if (value === "ENTRY_LEVEL") return "LESS_THAN_ONE_YEAR";
  if (value === "JUNIOR") return "TWO_YEARS";
  if (value === "MID_LEVEL") return "THREE_YEARS";
  if (value === "SENIOR") return "FIVE_YEARS";
  return "GREATER_THAN_FIVE_YEARS";
}

export async function getPublicJobs(params: ListJobsParams = {}) {
  const { data } = await apiClient.get<PageResponse<BackendJobPost> | BackendJobPost[]>("/opportunities/jobs", { params });
  return toPage(data, mapJob);
}

export async function getJobById(id: number | string) {
  const { data } = await apiClient.get<BackendJobPost>(`/opportunities/jobs/${id}`);
  return mapJob(data);
}

export async function getManagedJobs(params: ListJobsParams = {}) {
  const { data } = await apiClient.get<PageResponse<BackendJobPost> | BackendJobPost[]>("/owner/job-posts", { params });
  return toPage(data, mapJob);
}

export async function createJobOpportunity(payload: CreateJobOpportunityPayload) {
  const { data } = await apiClient.post<BackendJobPost>("/owner/job-posts", {
    title: payload.title,
    startingDate: todayIsoDate(),
    closingDate: dateAfterDays(30),
    jobDescription: payload.description,
    yearsOfExperienceRequired: toBackendExperienceLevel(payload.experienceLevel),
    jobPostFileUrl: payload.applyUrl || undefined,
    estimatedSalary: payload.salaryMax ?? payload.salaryMin,
  });
  return mapJob(data);
}

export async function updateJobOpportunity(id: number | string, payload: Partial<CreateJobOpportunityPayload>) {
  void id;
  void payload;
  throw new Error("The deployed backend does not expose job post updates yet.");
}

export async function publishJobOpportunity(id: number | string) {
  void id;
  throw new Error("The deployed backend publishes owner job posts when they are created.");
}

export async function closeJobOpportunity(id: number | string) {
  void id;
  throw new Error("The deployed backend does not expose job post closing yet.");
}

export async function archiveJobOpportunity(id: number | string) {
  void id;
  throw new Error("The deployed backend does not expose job post archiving yet.");
}

export async function applyForJob(id: number | string, payload: ApplyForJobPayload) {
  const { data } = await apiClient.post<BackendJobApplication>(`/opportunities/jobs/${id}/apply`, {
    resumeUrl: payload.cvUrl,
    certificateUrls: [],
  });
  return mapApplication(data);
}

export async function getMyJobApplications() {
  const { data } = await apiClient.get<PageResponse<BackendJobApplication> | BackendJobApplication[]>("/opportunities/applications");
  return toPage(data, mapApplication);
}

export async function getJobApplications(jobId: number | string) {
  const { data } = await apiClient.get<PageResponse<BackendJobApplication> | BackendJobApplication[]>(`/owner/job-posts/${jobId}/applications`);
  return toPage(data, mapApplication);
}

export async function updateJobApplicationStatus(applicationId: number | string, status: JobApplicationStatus) {
  if (status !== "REJECTED") {
    throw new Error("The deployed backend only exposes reject and interview-booking decisions for applications.");
  }

  const { data } = await apiClient.post<BackendJobApplication>(`/owner/job-posts/applications/${applicationId}/reject`);
  return mapApplication(data);
}
