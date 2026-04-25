import { Router } from "express";

import { recruitingCandidateController } from "../../controllers/recruiting-candidate.controller.js";

export const recruitingCandidateRouter = Router();

recruitingCandidateRouter.get("/candidates", recruitingCandidateController.list);
