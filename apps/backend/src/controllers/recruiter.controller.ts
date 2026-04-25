import type { Request, Response } from "express";

import type {
  CandidateListResponseDto,
  CreateJobRequestDto,
  CreateJobResponseDto,
  EmployeeListResponseDto,
  JobListResponseDto,
} from "@closed-ai/types";

import { AppError } from "../lib/app-error.js";
import { recruiterService } from "../services/recruiting/recruiter.service.js";

export const recruiterController = {
  async listCandidates(_req: Request, res: Response<CandidateListResponseDto>) {
    const payload = await recruiterService.listCandidates();
    return res.status(200).json(payload);
  },

  async listEmployees(_req: Request, res: Response<EmployeeListResponseDto>) {
    const payload = await recruiterService.listEmployees();
    return res.status(200).json(payload);
  },

  async listJobs(_req: Request, res: Response<JobListResponseDto>) {
    const payload = await recruiterService.listJobs();
    return res.status(200).json(payload);
  },

  async createJob(req: Request<unknown, CreateJobResponseDto, CreateJobRequestDto>, res: Response<CreateJobResponseDto>) {
    const payload = await recruiterService.createJob(req.body);
    return res.status(201).json(payload);
  },

  async sendTechnicalScreening(req: Request, res: Response) {
    const candidateId = req.params.candidateId;
    if (!candidateId) {
      throw new AppError("Candidate id is required.", 400, "CANDIDATE_ID_REQUIRED");
    }

    const candidate = await recruiterService.sendTechnicalScreening(candidateId);
    return res.status(200).json({ candidate });
  },

  async convertCandidateToEmployee(req: Request, res: Response) {
    const candidateId = req.params.candidateId;
    if (!candidateId) {
      throw new AppError("Candidate id is required.", 400, "CANDIDATE_ID_REQUIRED");
    }

    const payload = await recruiterService.convertCandidateToEmployee(candidateId);
    return res.status(200).json({ employee: payload });
  },
};
