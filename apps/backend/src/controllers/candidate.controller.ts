import type { Request, Response } from "express";

import type {
  CandidateJobListResponseDto,
  CandidateStatusResponseDto,
  ResumeSubmissionResponseDto,
} from "@closed-ai/types";

import { AppError } from "../lib/app-error.js";
import { resumeService } from "../services/recruiting/resume.service.js";

export const candidateController = {
  async getStatus(req: Request, res: Response<CandidateStatusResponseDto>) {
    const email = typeof req.query.email === "string" ? req.query.email : "";
    if (!email) {
      throw new AppError("Email query parameter is required.", 400, "INVALID_EMAIL");
    }

    const payload = await resumeService.getCandidateStatusByEmail(email);
    return res.status(200).json(payload);
  },

  async listJobs(req: Request, res: Response<CandidateJobListResponseDto>) {
    const email = typeof req.query.email === "string" ? req.query.email : "";
    if (!email) {
      throw new AppError("Email query parameter is required.", 400, "INVALID_EMAIL");
    }

    const payload = await resumeService.listJobsForCandidate(email);
    return res.status(200).json(payload);
  },

  async submitResume(req: Request, res: Response<ResumeSubmissionResponseDto>) {
    const email = req.body?.email?.trim();
    const jobId = req.body?.jobId?.trim();

    if (!email) {
      throw new AppError("Email is required.", 400, "INVALID_EMAIL");
    }

    if (!jobId) {
      throw new AppError("jobId is required.", 400, "JOB_ID_REQUIRED");
    }

    if (!req.file) {
      throw new AppError("Resume file is required.", 400, "RESUME_REQUIRED");
    }

    const payload = await resumeService.submitResume({
      email,
      jobId,
      file: {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        buffer: req.file.buffer,
      },
    });

    return res.status(201).json(payload);
  },
};
