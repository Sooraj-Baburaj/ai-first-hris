import { Router } from "express";

import { recruiterController } from "../../controllers/recruiter.controller.js";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";

export const recruiterRouter = Router();

recruiterRouter.get("/candidates", asyncHandler(recruiterController.listCandidates));
recruiterRouter.get("/employees", asyncHandler(recruiterController.listEmployees));
recruiterRouter.get("/jobs", asyncHandler(recruiterController.listJobs));
recruiterRouter.post("/jobs", asyncHandler(recruiterController.createJob));
recruiterRouter.post(
  "/candidates/:candidateId/send-technical-screening",
  asyncHandler(recruiterController.sendTechnicalScreening)
);
recruiterRouter.post(
  "/candidates/:candidateId/convert-to-employee",
  asyncHandler(recruiterController.convertCandidateToEmployee)
);
