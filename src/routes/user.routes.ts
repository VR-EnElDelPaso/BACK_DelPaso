import { Router, Request, Response } from "express";
import { CreateUser, verifyEmail, forgotPassword, resetPassword } from '../controllers/user.controllers';

const router = Router();

router.post("/new", CreateUser);

router.post("/verify-email", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;