import mongoose, { Schema } from "mongoose";

import type { ResumeFileType } from "@closed-ai/types";

export interface ResumeDocumentModel {
  candidateId: mongoose.Types.ObjectId;
  fileName: string;
  mimeType: ResumeFileType;
  sizeBytes: number;
  storagePath: string;
  textExtractStatus: "pending" | "complete" | "failed";
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const resumeDocumentSchema = new Schema<ResumeDocumentModel>(
  {
    candidateId: { type: Schema.Types.ObjectId, ref: "Candidate", required: true, index: true },
    fileName: { type: String, required: true, trim: true },
    mimeType: { type: String, required: true },
    sizeBytes: { type: Number, required: true },
    storagePath: { type: String, required: true },
    textExtractStatus: { type: String, required: true, default: "pending" },
    uploadedAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

export const ResumeDocumentModel =
  (mongoose.models.ResumeDocument as mongoose.Model<ResumeDocumentModel>) ||
  mongoose.model<ResumeDocumentModel>("ResumeDocument", resumeDocumentSchema);
