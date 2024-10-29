import { Router } from "express";

import { createPreferenceController, createPreferencesController } from "../controllers/preference.controllers";

import { AuthMiddleware } from "../middlewares";

const router = Router();

router.post("/multi", AuthMiddleware, createPreferencesController);

router.post("/:tour_id", AuthMiddleware, createPreferenceController);

export default router;