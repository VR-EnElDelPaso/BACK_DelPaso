import { Router } from "express";
import { createUserController, verifyUserEmailController } from "../controllers/user.controllers";

const router = Router();

// --- Create User ---
router.post("/new", createUserController);

router.post("/email-verify", verifyUserEmailController)

export default router;