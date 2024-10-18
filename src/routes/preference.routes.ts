import { Router } from "express";

import { createPreferenceController, createPreferencesController } from "../controllers/preference.controllers";

const router = Router();

router.post("/multi", createPreferencesController);

router.post("/:tour_id", createPreferenceController);

export default router;