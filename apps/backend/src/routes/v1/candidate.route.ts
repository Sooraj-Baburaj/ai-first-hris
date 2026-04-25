import { Router } from "express";

import { candidateController } from "../../controllers/candidate.controller.js";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";
import { resumeUploadMiddleware } from "../../middlewares/upload.middleware.js";

export const candidateRouter = Router();

candidateRouter.get("/status", asyncHandler(candidateController.getStatus));
candidateRouter.get("/jobs", asyncHandler(candidateController.listJobs));
candidateRouter.get("/screening-invite", asyncHandler(candidateController.getScreeningInviteByEmail));
candidateRouter.get("/screening/:inviteId", asyncHandler(candidateController.getScreeningInviteById));
candidateRouter.post("/screening/:inviteId/join", asyncHandler(candidateController.joinScreening));
candidateRouter.post("/screening/:inviteId/complete", asyncHandler(candidateController.completeScreening));
candidateRouter.post(
  "/resume",
  resumeUploadMiddleware,
  asyncHandler(candidateController.submitResume)
);
