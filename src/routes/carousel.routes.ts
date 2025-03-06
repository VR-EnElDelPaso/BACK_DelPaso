import { Router } from "express";
import {
  getCarousels,
  getCarouselById,
  createCarousel,
  updateCarousel,
  deleteCarousel,
} from "../controllers/carousel.controllers";

const router = Router();

/**
 * @route GET /api/carousels
 * @desc Get all carousels
 * @access Public
 */
router.get("/", getCarousels);

/**
 * @route GET /api/carousels/:id
 * @desc Get carousel by ID
 * @access Public
 */
router.get("/:id", getCarouselById);

/**
 * @route POST /api/carousels
 * @desc Create a new carousel
 * @access Admin
 */
router.post("/", createCarousel);

/**
 * @route PUT /api/carousels/:id
 * @desc Update a carousel
 * @access Admin
 */
router.put("/:id", updateCarousel);

/**
 * @route DELETE /api/carousels/:id
 * @desc Delete a carousel
 * @access Admin
 */
router.delete("/:id", deleteCarousel);

export default router;
