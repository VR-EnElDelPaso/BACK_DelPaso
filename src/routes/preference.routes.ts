import express from "express";
import { Router } from "express";
import { createPreferenceController, createPreferencesController } from "../controllers/preference.controllers";
import { handlePaymentWebhook } from "../controllers/webhook.controllers";
import { AuthMiddleware } from "../middlewares";

const router = Router();

router.post("/webhook", express.raw({ type: "application/json" }), AuthMiddleware, handlePaymentWebhook);
router.post("/multi", AuthMiddleware, createPreferencesController);
router.post("/:tour_id", AuthMiddleware, createPreferenceController);

export default router;