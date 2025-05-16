import { Router, Request, Response } from "express";
import { createUserController } from "../controllers/user.controllers";

const router = Router();

// --- Create User ---
router.post("/new", createUserController);

export default router;