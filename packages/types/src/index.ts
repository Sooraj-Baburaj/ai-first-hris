export interface HealthResponseDto {
  status: "ok";
  service: string;
  timestamp: string;
}

export type UserRole = "recruiter" | "candidate" | "employee";

export interface ResolveRoleRequestDto {
  email: string;
}

export interface ResolveRoleResponseDto {
  email: string;
  role: UserRole;
  route: string;
  label: string;
}

export type ApplicationStage =
  | "submitted"
  | "under_review"
  | "ready_for_screening"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected";

export type ApplicationStatus = ApplicationStage;

export type CandidateSource =
  | "referral"
  | "inbound"
  | "linkedin"
  | "agency"
  | "career_page";

export type ResumeFileType = "application/pdf" | "text/plain";

export interface ResumeFitMetricsDto {
  skillCoverage: number;
  experienceRelevance: number;
  domainAlignment: number;
  communicationClarity: number;
  strengths: string[];
  risks: string[];
}

export interface ResumeAnalysisDetailsDto {
  pros: string[];
  cons: string[];
  fitReasoning: string;
  compatibilityReasoning: string;
}

export interface TechnicalScreeningDto {
  status: "not_sent" | "auto_sent" | "manual_sent";
  sentAt?: string;
}

export interface ApplicationTimelineEventDto {
  id: string;
  label: string;
  detail: string;
  at: string;
}

export interface JobDto {
  id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobRequestDto {
  title: string;
  description: string;
}

export interface CreateJobResponseDto {
  job: JobDto;
}

export interface JobListResponseDto {
  items: JobDto[];
  total: number;
}

export interface ResumeDocumentDto {
  id: string;
  candidateId: string;
  fileName: string;
  mimeType: ResumeFileType;
  sizeBytes: number;
  storagePath: string;
  textExtractStatus: "pending" | "complete" | "failed";
  uploadedAt: string;
}

export interface CandidateSummaryDto {
  id: string;
  fullName: string;
  email: string;
  roleApplied: string;
  location: string;
  source: CandidateSource;
  stage: ApplicationStage;
  status: ApplicationStatus;
  fitScore: number;
  compatibilityScore: number;
  confidence: number;
  aiAnalysisFailed: boolean;
  analysisDetails: ResumeAnalysisDetailsDto;
  technicalScreening: TechnicalScreeningDto;
  summary: string;
  nextAction: string;
  reviewState: "auto_ready" | "recruiter_review" | "escalated";
  latestResumeUploadedAt?: string;
  fitMetrics: ResumeFitMetricsDto;
}

export interface CandidateListResponseDto {
  items: CandidateSummaryDto[];
  total: number;
}

export interface CandidateStatusDto {
  candidateId: string;
  email: string;
  fullName: string;
  roleApplied: string;
  stage: ApplicationStage;
  status: ApplicationStatus;
  compatibilityScore: number;
  confidence: number;
  aiAnalysisFailed: boolean;
  analysisDetails: ResumeAnalysisDetailsDto;
  technicalScreening: TechnicalScreeningDto;
  summary: string;
  timeline: ApplicationTimelineEventDto[];
  latestResume?: ResumeDocumentDto;
  fitMetrics: ResumeFitMetricsDto;
}

export interface CandidateStatusResponseDto {
  status: CandidateStatusDto;
}

export interface ResumeSubmissionResponseDto {
  resume: ResumeDocumentDto;
  status: CandidateStatusDto;
}

export interface CandidateJobDto {
  job: JobDto;
  applicationStatus: ApplicationStatus | null;
  appliedAt: string | null;
}

export interface CandidateJobListResponseDto {
  items: CandidateJobDto[];
  total: number;
}

export interface EmployeeSummaryDto {
  id: string;
  fullName: string;
  workEmail: string;
  department: string;
  manager: string;
  location: string;
  onboardingStatus: "onboarding" | "helpdesk" | "learning" | "healthy";
  progress: number;
  suggestedFollowUp: string;
  priority: "low" | "medium" | "high";
  convertedFromCandidateAt?: string;
}

export interface EmployeeListResponseDto {
  items: EmployeeSummaryDto[];
  total: number;
}
