import { Router } from "express";
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
  getPaginatedReviews,
} from "../controllers/reviews.controllers";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

router.post("/:tour_id", authMiddleware, createReview);
router.get("/", getAllReviews);
router.get("/:tour_id/reviews", getPaginatedReviews);
router.put("/:id", authMiddleware, updateReview);
router.delete("/:id", authMiddleware, deleteReview);

export default router;
