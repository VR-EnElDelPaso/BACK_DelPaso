import { Router, Request, Response } from "express";
import { AuthMiddleware } from "../middlewares";
import { createReview, getAllReviews, updateReview, deleteReview } from "../controllers/reviews.controllers";

const router = Router();

router.post("/:tour_id", AuthMiddleware, createReview);
router.get("/", getAllReviews);
router.put("/:id", AuthMiddleware, updateReview);
router.delete("/:id", AuthMiddleware, deleteReview);

export default router;