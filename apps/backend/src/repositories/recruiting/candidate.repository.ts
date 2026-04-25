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

type ScreeningInvitationInput = {
  id: string;
  roomName: string;
  joinUrl: string;
  participantName: string;
  createdAt: Date;
  expiresAt?: Date;
};

type ScreeningOutcomeInput = {
  completedAt: Date;
  durationSeconds: number;
  summary: string;
  recommendation: "advance" | "reject" | "needs_review";
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

  async updateIdentity(candidateId: string, input: { fullName?: string }) {
    const nextSet: { fullName?: string } = {};
    if (input.fullName?.trim()) {
      nextSet.fullName = input.fullName.trim();
    }
    if (Object.keys(nextSet).length === 0) {
      return CandidateModel.findById(candidateId);
    }
    return CandidateModel.findByIdAndUpdate(candidateId, { $set: nextSet }, { new: true });
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

  async setScreeningInvitation(candidateId: string, invitation: ScreeningInvitationInput) {
    return CandidateModel.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          "technicalScreening.status": "auto_sent",
          "technicalScreening.sentAt": invitation.createdAt,
          "technicalScreening.invitation": invitation,
        },
      },
      { new: true }
    );
  },

  async findByScreeningInviteId(inviteId: string) {
    return CandidateModel.findOne({
      "technicalScreening.invitation.id": inviteId,
    });
  },

  async markScreeningInviteJoined(candidateId: string) {
    return CandidateModel.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          "technicalScreening.invitation.joinedAt": new Date(),
        },
      },
      { new: true }
    );
  },

  async setScreeningOutcome(candidateId: string, outcome: ScreeningOutcomeInput) {
    return CandidateModel.findByIdAndUpdate(
      candidateId,
      {
        $set: {
          "technicalScreening.outcome": outcome,
        },
      },
      { new: true }
    );
  },

  async listForRecruiter() {
    return CandidateModel.find().sort({ updatedAt: -1 }).lean();
  },
};
