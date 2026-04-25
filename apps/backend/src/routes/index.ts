import { Router } from "express";

import { API_PREFIX } from "../config/constants.js";
import { healthRouter } from "./health.route.js";
import { authRouter } from "./v1/auth.route.js";
import { candidateRouter } from "./v1/candidate.route.js";
import { recruiterRouter } from "./v1/recruiter.route.js";

export const appRouter = Router();

appRouter.use(healthRouter);
appRouter.use(`${API_PREFIX}/auth`, authRouter);
appRouter.use(`${API_PREFIX}/recruiter`, recruiterRouter);
appRouter.use(`${API_PREFIX}/candidate`, candidateRouter);
