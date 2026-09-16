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
  applicationType?: string | null;
  estimatedSalary?: number | string | null;
  currency?: string | null;
  location?: string | null;
  workplaceType?: string | null;
  employmentType?: string | null;
  salaryMin?: number | string | null;
  salaryMax?: number | string | null;
  contactEmail?: string | null;
  responsibilities?: string | null;
  requirements?: string | null;
  benefits?: string | null;
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
  // Fail closed: an unrecognized backend status must never render as OPEN
  // and invite applications to a post whose state we do not understand.
  return "ARCHIVED";
}

function textOrNull(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapApplicationType(post: BackendJobPost): JobOpportunity["applicationType"] {
  // Prefer an explicit backend value when the API starts sending one.
  if (post.applicationType === "EXTERNAL") return "EXTERNAL";
  if (post.applicationType === "INTERNAL") return "INTERNAL";
  // Otherwise derive it: a stored external link (website or mailto) means
  // the owner posted an external application; without one it is internal.
  return post.jobPostFileUrl ? "EXTERNAL" : "INTERNAL";
}

function mapJob(post: BackendJobPost): JobOpportunity {
  const salary = asNumber(post.estimatedSalary);
  const salaryMin = asNumber(post.salaryMin) ?? salary;
  const salaryMax = asNumber(post.salaryMax) ?? salary ?? salaryMin;

  return {
    id: post.id,
    title: post.title,
    companyName: post.businessName ?? "King Sparkon business",
    businessId: post.businessId ?? null,
    location: textOrNull(post.location) ?? "Business location",
    workplaceType: post.workplaceType === "REMOTE" || post.workplaceType === "HYBRID" ? post.workplaceType : "ONSITE",
    employmentType:
      post.employmentType === "PART_TIME" ||
      post.employmentType === "CONTRACT" ||
      post.employmentType === "INTERNSHIP" ||
      post.employmentType === "TEMPORARY"
        ? post.employmentType
        : "FULL_TIME",
    experienceLevel: mapExperienceLevel(post.yearsOfExperienceRequired),
    salaryMin,
    salaryMax,
    salaryCurrency: post.currency ?? "ZAR",
    description: post.jobDescription ?? "",
    responsibilities: textOrNull(post.responsibilities),
    requirements: textOrNull(post.requirements) ?? (post.yearsOfExperienceRequired ? `Experience required: ${post.yearsOfExperienceRequired.replaceAll("_", " ").toLowerCase()}.` : "See job description."),
    benefits: textOrNull(post.benefits),
    applyUrl: post.jobPostFileUrl ?? null,
    contactEmail: textOrNull(post.contactEmail),
    applicationType: mapApplicationType(post),
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
    // External posts persist their application target (website URL or
    // mailto: link) in the stored file-URL field; internal posts store
    // nothing, which is also how the type is derived when reading back.
    jobPostFileUrl: payload.applicationType === "EXTERNAL" ? normalizeExternalTarget(payload.applyUrl) : undefined,
    applicationType: payload.applicationType,
    estimatedSalary: payload.salaryMax ?? payload.salaryMin,
    currency: payload.salaryCurrency || undefined,
    location: payload.location || undefined,
    workplaceType: payload.workplaceType,
    employmentType: payload.employmentType,
    salaryMin: payload.salaryMin,
    salaryMax: payload.salaryMax ?? payload.salaryMin,
    contactEmail: payload.contactEmail || undefined,
    responsibilities: payload.responsibilities || undefined,
    requirements: payload.requirements || undefined,
    benefits: payload.benefits || undefined,
  });
  return mapJob(data);
}

/**
 * Normalize an owner-supplied external application target into a stored
 * link: plain email addresses become `mailto:` links, bare domains gain
 * `https://`. Returns undefined when nothing usable was provided.
 */
export function normalizeExternalTarget(target: string | undefined): string | undefined {
  const value = (target ?? "").trim();
  if (!value) return undefined;
  if (/^mailto:/i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return `mailto:${value}`;
  if (/^[^\s]+\.[^\s]{2,}$/.test(value)) return `https://${value}`;
  return value;
}

/** True when the stored target is an email (`mailto:`) link. */
export function isEmailTarget(target: string | null | undefined): boolean {
  return !!target && (/^mailto:/i.test(target) || (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target) && !/^https?:\/\//i.test(target)));
}

export async function updateJobOpportunity(id: number | string, payload: Partial<CreateJobOpportunityPayload>) {
  void id;
  void payload;
  throw new Error("The deployed backend does not expose job post updates yet.");
}

export async function publishJobOpportunity(id: number | string) {
  const { data } = await apiClient.post<BackendJobPost>(`/owner/job-posts/${id}/publish`);
  return mapJob(data);
}

export async function closeJobOpportunity(id: number | string) {
  const { data } = await apiClient.post<BackendJobPost>(`/owner/job-posts/${id}/close`);
  return mapJob(data);
}

export async function archiveJobOpportunity(id: number | string) {
  const { data } = await apiClient.post<BackendJobPost>(`/owner/job-posts/${id}/archive`);
  return mapJob(data);
}

export async function applyForJob(id: number | string, payload: ApplyForJobPayload) {
  const { data } = await apiClient.post<BackendJobApplication>(`/opportunities/jobs/${id}/apply`, {
    resumeUrl: payload.cvUrl,
    certificateUrls: [],
  });
  return mapApplication(data);
}

function extractResumeUrl(data: unknown): string | null {
  if (typeof data === "string" && data.startsWith("http")) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["resumeUrl", "fileUrl", "url"]) {
      const value = record[key];
      if (typeof value === "string" && value.startsWith("http")) return value;
    }
    const nested = record.data;
    if (nested && typeof nested === "object") {
      for (const key of ["resumeUrl", "fileUrl", "url"]) {
        const value = (nested as Record<string, unknown>)[key];
        if (typeof value === "string" && value.startsWith("http")) return value;
      }
    }
  }
  return null;
}

/**
 * Upload a CV file (PDF/DOC/DOCX) for a job application.
 * Follows the app's multipart convention (`file` field, axios sets the
 * boundary). The backend must expose `POST /opportunities/jobs/{id}/resume`
 * returning the stored file URL — if it does not exist yet, this throws
 * and callers should fall back to a pasted CV link.
 */
export async function uploadJobApplicationCv(id: number | string, file: File): Promise<{ resumeUrl: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const { data } = await apiClient.post<unknown>(`/opportunities/jobs/${id}/resume`, formData);
  const resumeUrl = extractResumeUrl(data);
  if (!resumeUrl) {
    throw new Error("CV upload did not return a file URL. Paste a CV link instead or try again later.");
  }
  return { resumeUrl };
}

export async function getMyJobApplications() {
  const { data } = await apiClient.get<PageResponse<BackendJobApplication> | BackendJobApplication[]>("/opportunities/applications");
  return toPage(data, mapApplication);
}

export async function getJobApplications(jobId: number | string) {
  const { data } = await apiClient.get<PageResponse<BackendJobApplication> | BackendJobApplication[]>(`/owner/job-posts/${jobId}/applications`);
  return toPage(data, mapApplication);
}

export async function acceptJobApplication(applicationId: number | string) {
  const { data } = await apiClient.post<BackendJobApplication>(`/owner/job-posts/applications/${applicationId}/accept`);
  return mapApplication(data);
}

export async function updateJobApplicationStatus(applicationId: number | string, status: JobApplicationStatus) {
  if (status === "ACCEPTED") return acceptJobApplication(applicationId);
  if (status === "REJECTED") {
    const { data } = await apiClient.post<BackendJobApplication>(`/owner/job-posts/applications/${applicationId}/reject`);
    return mapApplication(data);
  }
  throw new Error(`Status "${status}" cannot be set from here. Owners can accept or reject; interviews are booked separately.`);
}
