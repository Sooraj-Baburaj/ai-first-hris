import type {
  ApplicationStage,
  ApplicationStatus,
  CandidateSource,
  ResumeAnalysisDetailsDto,
  ResumeFitMetricsDto,
  TechnicalScreeningDto,
} from "@closed-ai/types";

import { CandidateModel } from "../../models/recruiting/candidate.model.js";

type CandidateUpsertInput = {
  email: string;
  fullName: string;
  roleApplied?: string;
  source?: CandidateSource;
  location?: string;
};

type CandidateStatusUpdateInput = {
  stage: ApplicationStage;
  status: ApplicationStatus;
  summary: string;
  nextAction: string;
  reviewState: "auto_ready" | "recruiter_review" | "escalated";
  confidence: number;
  fitScore: number;
  compatibilityScore: number;
  aiAnalysisFailed?: boolean;
  fitMetrics?: ResumeFitMetricsDto;
  analysisDetails?: ResumeAnalysisDetailsDto;
  technicalScreening?: TechnicalScreeningDto;
};

function defaultNameFromEmail(email: string) {
  const local = email.split("@")[0] ?? "candidate";
  return local
    .split(/[._-]/g)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export const candidateRepository = {
  async findById(candidateId: string) {
    return CandidateModel.findById(candidateId);
  },

  async findByEmail(email: string) {
    return CandidateModel.findOne({ email: email.toLowerCase().trim() });
  },

  async upsertByEmail(input: CandidateUpsertInput) {
    const email = input.email.toLowerCase().trim();

    return CandidateModel.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          email,
          fullName: input.fullName || defaultNameFromEmail(email),
          roleApplied: input.roleApplied ?? "General Application",
          source: input.source ?? "career_page",
          location: input.location ?? "Unknown",
          currentStage: "submitted",
          applicationStatus: "submitted",
          fitScore: 65,
          compatibilityScore: 60,
          confidence: 72,
          aiAnalysisFailed: false,
          fitMetrics: {
            skillCoverage: 65,
            experienceRelevance: 66,
            domainAlignment: 64,
            communicationClarity: 70,
            strengths: [],
            risks: [],
          },
          analysisDetails: {
            pros: [],
            cons: [],
            fitReasoning: "",
            compatibilityReasoning: "",
          },
          technicalScreening: {
            status: "not_sent",
          },
          summary: "Application received. Resume is waiting for parsing.",
          nextAction: "Upload resume",
          reviewState: "recruiter_review",
        },
      },
      {
        upsert: true,
        new: true,
      }
    );
  },

  async updateLatestResume(candidateId: string, resumeId: string) {
    return CandidateModel.findByIdAndUpdate(
      candidateId,
      {
        $set: { latestResumeId: resumeId },
      },
      { new: true }
    );
  },

  async updateCandidateStatus(candidateId: string, update: CandidateStatusUpdateInput) {
    const nextSet = {
      currentStage: update.stage,
      applicationStatus: update.status,
      summary: update.summary,
      nextAction: update.nextAction,
      reviewState: update.reviewState,
      confidence: update.confidence,
      fitScore: update.fitScore,
      compatibilityScore: update.compatibilityScore,
      aiAnalysisFailed: update.aiAnalysisFailed ?? false,
      fitMetrics: update.fitMetrics,
      analysisDetails: update.analysisDetails,
      technicalScreening: update.technicalScreening,
    };

    return CandidateModel.findByIdAndUpdate(
      candidateId,
      {
        $set: nextSet,
      },
      { new: true }
    );
  },

  async updateTechnicalScreening(candidateId: string, technicalScreening: TechnicalScreeningDto) {
    return CandidateModel.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          technicalScreening,
        },
      },
      { new: true }
    );
  },

  async listForRecruiter() {
    return CandidateModel.find().sort({ updatedAt: -1 }).lean();
  },
};
