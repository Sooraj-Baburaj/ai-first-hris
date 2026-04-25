import type {
  ApplicationTimelineEventDto,
  CandidateStatusDto,
  CandidateSummaryDto,
  EmployeeSummaryDto,
  JobDto,
  ResumeDocumentDto,
  ResumeFitMetricsDto,
  TechnicalScreeningDto,
} from "@closed-ai/types";

type CandidateLike = {
  _id: { toString(): string };
  fullName: string;
  email: string;
  roleApplied: string;
  location: string;
  source: CandidateSummaryDto["source"];
  currentStage: CandidateSummaryDto["stage"];
  applicationStatus: CandidateSummaryDto["status"];
  fitScore: number;
  compatibilityScore: number;
  confidence: number;
  aiAnalysisFailed: boolean;
  fitMetrics: ResumeFitMetricsDto;
  analysisDetails: CandidateSummaryDto["analysisDetails"];
  technicalScreening: {
    status: TechnicalScreeningDto["status"];
    sentAt?: string | Date;
  };
  summary: string;
  nextAction: string;
  reviewState: CandidateSummaryDto["reviewState"];
  updatedAt?: Date;
};

type ResumeLike = {
  _id: { toString(): string };
  candidateId: { toString(): string };
  fileName: string;
  mimeType: ResumeDocumentDto["mimeType"];
  sizeBytes: number;
  storagePath: string;
  textExtractStatus: ResumeDocumentDto["textExtractStatus"];
  uploadedAt: Date;
};

type EmployeeLike = {
  _id: { toString(): string };
  fullName: string;
  workEmail: string;
  department: string;
  manager: string;
  location: string;
  onboardingStatus: EmployeeSummaryDto["onboardingStatus"];
  progress: number;
  suggestedFollowUp: string;
  priority: EmployeeSummaryDto["priority"];
  convertedFromCandidateAt?: Date;
};

type JobLike = {
  _id: { toString(): string };
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export function toResumeDto(resume: ResumeLike): ResumeDocumentDto {
  return {
    id: resume._id.toString(),
    candidateId: resume.candidateId.toString(),
    fileName: resume.fileName,
    mimeType: resume.mimeType,
    sizeBytes: resume.sizeBytes,
    storagePath: resume.storagePath,
    textExtractStatus: resume.textExtractStatus,
    uploadedAt: resume.uploadedAt.toISOString(),
  };
}

export function toJobDto(job: JobLike): JobDto {
  return {
    id: job._id.toString(),
    title: job.title,
    description: job.description,
    createdAt: job.createdAt.toISOString(),
    updatedAt: job.updatedAt.toISOString(),
  };
}

export function toCandidateSummaryDto(candidate: CandidateLike): CandidateSummaryDto {
  return {
    id: candidate._id.toString(),
    fullName: candidate.fullName,
    email: candidate.email,
    roleApplied: candidate.roleApplied,
    location: candidate.location,
    source: candidate.source,
    stage: candidate.currentStage,
    status: candidate.applicationStatus,
    fitScore: candidate.fitScore,
    compatibilityScore: candidate.compatibilityScore,
    confidence: candidate.confidence,
    aiAnalysisFailed: candidate.aiAnalysisFailed,
    fitMetrics: candidate.fitMetrics,
    analysisDetails: candidate.analysisDetails,
    technicalScreening: {
      status: candidate.technicalScreening?.status ?? "not_sent",
      sentAt:
        typeof candidate.technicalScreening?.sentAt === "string"
          ? candidate.technicalScreening?.sentAt
          : candidate.technicalScreening?.sentAt?.toISOString(),
    },
    summary: candidate.summary,
    nextAction: candidate.nextAction,
    reviewState: candidate.reviewState,
    latestResumeUploadedAt: candidate.updatedAt?.toISOString(),
  };
}

export function toEmployeeSummaryDto(employee: EmployeeLike): EmployeeSummaryDto {
  return {
    id: employee._id.toString(),
    fullName: employee.fullName,
    workEmail: employee.workEmail,
    department: employee.department,
    manager: employee.manager,
    location: employee.location,
    onboardingStatus: employee.onboardingStatus,
    progress: employee.progress,
    suggestedFollowUp: employee.suggestedFollowUp,
    priority: employee.priority,
    convertedFromCandidateAt: employee.convertedFromCandidateAt?.toISOString(),
  };
}

export function toTimelineDto(
  timeline: { id: string; label: string; detail: string; at: Date }[]
): ApplicationTimelineEventDto[] {
  return timeline.map((event) => ({
    id: event.id,
    label: event.label,
    detail: event.detail,
    at: event.at.toISOString(),
  }));
}

export function toCandidateStatusDto(payload: {
  candidate: CandidateLike;
  timeline: ApplicationTimelineEventDto[];
  latestResume?: ResumeDocumentDto;
}): CandidateStatusDto {
  return {
    candidateId: payload.candidate._id.toString(),
    email: payload.candidate.email,
    fullName: payload.candidate.fullName,
    roleApplied: payload.candidate.roleApplied,
    stage: payload.candidate.currentStage,
    status: payload.candidate.applicationStatus,
    compatibilityScore: payload.candidate.compatibilityScore,
    confidence: payload.candidate.confidence,
    aiAnalysisFailed: payload.candidate.aiAnalysisFailed,
    fitMetrics: payload.candidate.fitMetrics,
    analysisDetails: payload.candidate.analysisDetails,
    technicalScreening: {
      status: payload.candidate.technicalScreening?.status ?? "not_sent",
      sentAt:
        typeof payload.candidate.technicalScreening?.sentAt === "string"
          ? payload.candidate.technicalScreening?.sentAt
          : payload.candidate.technicalScreening?.sentAt?.toISOString(),
    },
    summary: payload.candidate.summary,
    timeline: payload.timeline,
    latestResume: payload.latestResume,
  };
}
