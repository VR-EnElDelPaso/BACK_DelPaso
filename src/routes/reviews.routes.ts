import { Router } from "express";
import { AuthMiddleware } from "../middlewares";
import {
  createReview,
  getAllReviews,
  updateReview,
  deleteReview,
  getPaginatedReviews,
} from "../controllers/reviews.controllers";

const router = Router();

router.post("/:tour_id", AuthMiddleware, createReview);
router.get("/", getAllReviews);
router.get("/:tour_id/reviews", getPaginatedReviews);
router.put("/:id", AuthMiddleware, updateReview);
router.delete("/:id", AuthMiddleware, deleteReview);

export default router;
