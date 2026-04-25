import type { Request, Response } from "express";

import type { CandidateListResponseDto } from "@closed-ai/types";

import { candidateService } from "../services/recruiting/candidate.service.js";

export const recruitingCandidateController = {
  async list(_req: Request, res: Response<CandidateListResponseDto>) {
    const payload = await candidateService.listCandidates();

    return res.status(200).json(payload);
  },
};
