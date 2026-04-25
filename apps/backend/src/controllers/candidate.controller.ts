import type { Request, Response } from "express";

import type {
  CandidateCompleteScreeningResponseDto,
  CandidateJoinScreeningResponseDto,
  CandidateScreeningInviteResponseDto,
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

  async getScreeningInviteByEmail(req: Request, res: Response<CandidateScreeningInviteResponseDto>) {
    const email = typeof req.query.email === "string" ? req.query.email : "";
    if (!email) {
      throw new AppError("Email query parameter is required.", 400, "INVALID_EMAIL");
    }
    const payload = await resumeService.getScreeningInviteByEmail(email);
    return res.status(200).json(payload);
  },

  async getScreeningInviteById(req: Request, res: Response<CandidateScreeningInviteResponseDto>) {
    const inviteId = req.params.inviteId?.trim();
    if (!inviteId) {
      throw new AppError("inviteId route parameter is required.", 400, "INVALID_INVITE_ID");
    }
    const payload = await resumeService.getScreeningInviteById(inviteId);
    return res.status(200).json(payload);
  },

  async joinScreening(req: Request, res: Response<CandidateJoinScreeningResponseDto>) {
    const inviteId = req.params.inviteId?.trim();
    if (!inviteId) {
      throw new AppError("inviteId route parameter is required.", 400, "INVALID_INVITE_ID");
    }
    const payload = await resumeService.joinScreeningByInviteId(inviteId);
    return res.status(200).json(payload);
  },

  async completeScreening(
    req: Request,
    res: Response<CandidateCompleteScreeningResponseDto>
  ) {
    const inviteId = req.params.inviteId?.trim();
    if (!inviteId) {
      throw new AppError("inviteId route parameter is required.", 400, "INVALID_INVITE_ID");
    }
    const durationSeconds = Number(req.body?.durationSeconds);
    if (!Number.isFinite(durationSeconds) || durationSeconds < 0) {
      throw new AppError("durationSeconds must be a non-negative number.", 400, "INVALID_DURATION");
    }
    const payload = await resumeService.completeScreeningByInviteId(inviteId, { durationSeconds });
    return res.status(200).json(payload);
  },
};
