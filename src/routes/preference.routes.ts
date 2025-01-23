import { Router } from "express";

import { createPreferenceController } from "../controllers/preference.controllers";

import { AuthMiddleware } from "../middlewares";

const router = Router();

router.post("/", AuthMiddleware, createPreferenceController);

export default router;