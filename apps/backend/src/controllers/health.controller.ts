import type { Request, Response } from "express";

import type { HealthResponseDto } from "@closed-ai/types";

export const healthController = {
  getStatus(_req: Request, res: Response<HealthResponseDto>) {
    return res.status(200).json({
      status: "ok",
      service: "@closed-ai/backend",
      timestamp: new Date().toISOString(),
    });
  },
};
