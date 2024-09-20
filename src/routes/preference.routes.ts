import { Request, Response, Router } from "express";

import prisma from "../prisma";
import { createPreferenceController, createPreferencesController } from "../controllers/preference.controllers";

const router = Router();

router.post("/:tour_id", createPreferenceController);
router.post("/", createPreferencesController);

export default router;