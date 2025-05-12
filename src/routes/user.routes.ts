import { Router, Request, Response } from "express";
import { createMuseumController } from "../controllers/museums.controllers";

const router = Router();

// --- Create User ---
router.post("/new", async (req: Request, res: Response) => createMuseumController);

export default router;