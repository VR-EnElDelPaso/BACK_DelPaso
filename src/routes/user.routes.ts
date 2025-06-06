import { Router } from "express";
import {
  createUserController,
  sendVerificationEmailController,
  verifyUserEmailController,
  updateUserController,
  getUserProfileController,
} from "../controllers/user.controllers";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

// --- Public Routes ---
// Create User
router.post("/new", createUserController);

// Email Verification
router.post("/email-verify", verifyUserEmailController);

// Send Verification Email
router.post("/send-verification-email", sendVerificationEmailController);

// --- Protected Routes (require authentication) ---
// Update User Profile
router.put("/update", authMiddleware, updateUserController);

// Get User Profile
router.get("/profile", authMiddleware, getUserProfileController);

export default router;
