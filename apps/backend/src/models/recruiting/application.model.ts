import mongoose, { Schema } from "mongoose";

import type { ApplicationStage, ApplicationStatus } from "@closed-ai/types";

export interface ApplicationTimelineEntry {
  id: string;
  label: string;
  detail: string;
  at: Date;
}

export interface ApplicationDocument {
  candidateId: mongoose.Types.ObjectId;
  jobId: mongoose.Types.ObjectId;
  stage: ApplicationStage;
  status: ApplicationStatus;
  confidence?: number;
  recruiterNotes?: string;
  timeline: ApplicationTimelineEntry[];
  createdAt: Date;
  updatedAt: Date;
}

const applicationSchema = new Schema<ApplicationDocument>(
  {
    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    stage: { type: String, required: true },
    status: { type: String, required: true },
    confidence: { type: Number, required: false },
    recruiterNotes: { type: String, required: false },
    timeline: {
      type: [
        {
          id: { type: String, required: true },
          label: { type: String, required: true },
          detail: { type: String, required: true },
          at: { type: Date, required: true },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

applicationSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });

export const ApplicationModel =
  (mongoose.models.Application as mongoose.Model<ApplicationDocument>) ||
  mongoose.model<ApplicationDocument>("Application", applicationSchema);
