import { Router } from "express";
import {
  getAllFaqsController,
  getFaqByIdController,
  createFaqController,
  updateFaqController,
  deleteFaqController,
} from "../controllers/faq.controllers";

const router = Router();

// GET all FAQs
router.get("/", getAllFaqsController);

// GET FAQ by ID
router.get("/:id", getFaqByIdController);

// Create new FAQ
router.post("/", createFaqController);

// Update FAQ (partial update)
router.patch("/:id", updateFaqController);

// Delete FAQ
router.delete("/:id", deleteFaqController);

export default router;
