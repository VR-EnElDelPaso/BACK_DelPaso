import { Router } from "express";
import { createUserController, sendVerificationEmailController, verifyUserEmailController } from "../controllers/user.controllers";

const router = Router();

// --- Create User ---
router.post("/new", createUserController);

router.post("/email-verify", verifyUserEmailController)

router.post("/send-verification-email", sendVerificationEmailController)

export default router;