import type { NextFunction, Request, Response } from "express";

import { AppError } from "../lib/app-error.js";

export function notFoundMiddleware(_req: Request, _res: Response, next: NextFunction) {
  next(new AppError("Route not found", 404, "NOT_FOUND"));
}

export function errorHandlerMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  void _next;

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
  }

  return res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
}
