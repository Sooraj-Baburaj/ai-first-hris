import { Router } from "express";

import { authController } from "../../controllers/auth.controller.js";
import { asyncHandler } from "../../middlewares/async-handler.middleware.js";

export const authRouter = Router();

authRouter.post("/resolve-role", asyncHandler(authController.resolveRole));
