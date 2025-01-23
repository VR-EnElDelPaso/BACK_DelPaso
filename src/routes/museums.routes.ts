import { Router } from "express";
import {
  createMuseumController,
  deleteMuseumController,
  editMuseumController,
  getAllMuseumsController,
  getMuseumByIdController,
  getMuseumToursController
} from "../controllers/museums.controllers";

const router = Router();

// CRUD
router.get("/", getAllMuseumsController);
router.get("/:id", getMuseumByIdController);
router.post("/", createMuseumController);
router.patch("/:id", editMuseumController);
router.delete("/:id", deleteMuseumController);

// Sub resources
router.use("/:museum_id/tours", getMuseumToursController);

export default router;