import { ResumeDocumentModel } from "../../models/recruiting/resume-document.model.js";

export const resumeRepository = {
  async create(input: {
    candidateId: string;
    fileName: string;
    mimeType: "application/pdf" | "text/plain";
    sizeBytes: number;
    storagePath: string;
    textExtractStatus: "pending" | "complete" | "failed";
  }) {
    return ResumeDocumentModel.create({
      candidateId: input.candidateId,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      storagePath: input.storagePath,
      textExtractStatus: input.textExtractStatus,
      uploadedAt: new Date(),
    });
  },

  async findLatestByCandidateId(candidateId: string) {
    return ResumeDocumentModel.findOne({ candidateId }).sort({ uploadedAt: -1 });
  },
};
