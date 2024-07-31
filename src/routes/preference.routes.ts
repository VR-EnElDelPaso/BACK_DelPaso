import { Request, Response, Router } from "express";

import prisma from "../prisma";
import { createPreferenceController } from "../controllers/preference.controllers";

const router = Router();

router.post("/:tour_id", createPreferenceController);

export default router;