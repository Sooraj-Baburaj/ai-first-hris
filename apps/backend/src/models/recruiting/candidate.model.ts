import mongoose, { Schema } from "mongoose";

import type { ApplicationStage, ApplicationStatus, CandidateSource } from "@closed-ai/types";

export interface CandidateDocument {
  fullName: string;
  email: string;
  phone?: string;
  roleApplied: string;
  source: CandidateSource;
  location: string;
  currentStage: ApplicationStage;
  applicationStatus: ApplicationStatus;
  fitScore: number;
  compatibilityScore: number;
  confidence: number;
  aiAnalysisFailed: boolean;
  fitMetrics: {
    skillCoverage: number;
    experienceRelevance: number;
    domainAlignment: number;
    communicationClarity: number;
    strengths: string[];
    risks: string[];
  };
  analysisDetails: {
    pros: string[];
    cons: string[];
    fitReasoning: string;
    compatibilityReasoning: string;
  };
  technicalScreening: {
    status: "not_sent" | "auto_sent" | "manual_sent";
    sentAt?: Date;
    invitation?: {
      id: string;
      roomName: string;
      joinUrl: string;
      participantName: string;
      createdAt: Date;
      expiresAt?: Date;
      joinedAt?: Date;
    };
    outcome?: {
      completedAt: Date;
      durationSeconds: number;
      summary: string;
      recommendation: "advance" | "reject" | "needs_review";
    };
  };
  summary: string;
  nextAction: string;
  reviewState: "auto_ready" | "recruiter_review" | "escalated";
  latestResumeId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const candidateSchema = new Schema<CandidateDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: false, trim: true },
    roleApplied: { type: String, required: true, trim: true },
    source: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    currentStage: { type: String, required: true },
    applicationStatus: { type: String, required: true },
    fitScore: { type: Number, required: true, default: 68 },
    compatibilityScore: { type: Number, required: true, default: 60 },
    confidence: { type: Number, required: true, default: 70 },
    aiAnalysisFailed: { type: Boolean, required: true, default: false },
    fitMetrics: {
      type: {
        skillCoverage: { type: Number, required: true, default: 65 },
        experienceRelevance: { type: Number, required: true, default: 66 },
        domainAlignment: { type: Number, required: true, default: 64 },
        communicationClarity: { type: Number, required: true, default: 70 },
        strengths: { type: [String], required: true, default: [] },
        risks: { type: [String], required: true, default: [] },
      },
      required: true,
    },
    analysisDetails: {
      type: {
        pros: { type: [String], required: true, default: [] },
        cons: { type: [String], required: true, default: [] },
        fitReasoning: { type: String, required: true, default: "" },
        compatibilityReasoning: { type: String, required: true, default: "" },
      },
      required: true,
    },
    technicalScreening: {
      type: {
        status: { type: String, required: true, default: "not_sent" },
        sentAt: { type: Date, required: false },
        invitation: {
          type: {
            id: { type: String, required: true },
            roomName: { type: String, required: true },
            joinUrl: { type: String, required: true },
            participantName: { type: String, required: true },
            createdAt: { type: Date, required: true },
            expiresAt: { type: Date, required: false },
            joinedAt: { type: Date, required: false },
          },
          required: false,
        },
        outcome: {
          type: {
            completedAt: { type: Date, required: true },
            durationSeconds: { type: Number, required: true },
            summary: { type: String, required: true },
            recommendation: {
              type: String,
              required: true,
              enum: ["advance", "reject", "needs_review"],
            },
          },
          required: false,
        },
      },
      required: true,
    },
    summary: {
      type: String,
      required: true,
      default: "Resume received. Waiting for recruiter screening review.",
    },
    nextAction: {
      type: String,
      required: true,
      default: "Recruiter review in queue",
    },
    reviewState: {
      type: String,
      required: true,
      default: "recruiter_review",
    },
    latestResumeId: {
      type: Schema.Types.ObjectId,
      ref: "ResumeDocument",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

export const CandidateModel =
  (mongoose.models.Candidate as mongoose.Model<CandidateDocument>) ||
  mongoose.model<CandidateDocument>("Candidate", candidateSchema);
