import type { Request, Response } from "express";

import type { ResolveRoleRequestDto, ResolveRoleResponseDto } from "@closed-ai/types";

import { AppError } from "../lib/app-error.js";
import { authService } from "../services/auth.service.js";

export const authController = {
  async resolveRole(
    req: Request<unknown, ResolveRoleResponseDto, ResolveRoleRequestDto>,
    res: Response<ResolveRoleResponseDto>
  ) {
    const email = req.body?.email?.trim();
    if (!email) {
      throw new AppError("Email is required.", 400, "INVALID_EMAIL");
    }

    const payload = await authService.resolveRoleByEmail(email);
    return res.status(200).json(payload);
  },
};
