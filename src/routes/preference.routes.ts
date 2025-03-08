import { Router } from "express";

import { createPreferenceController } from "../controllers/preference.controllers";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

router.post("/", authMiddleware, createPreferenceController);

export default router;