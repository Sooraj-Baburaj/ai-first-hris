import { Router } from "express";

import { candidateController } from "../../controllers/candidate.controller.js";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";
import { resumeUploadMiddleware } from "../../middlewares/upload.middleware.js";

export const candidateRouter = Router();

candidateRouter.get("/status", asyncHandler(candidateController.getStatus));
candidateRouter.get("/jobs", asyncHandler(candidateController.listJobs));
candidateRouter.post(
  "/resume",
  resumeUploadMiddleware,
  asyncHandler(candidateController.submitResume)
);
