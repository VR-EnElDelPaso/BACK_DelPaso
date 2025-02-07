import { Router } from "express";
import {
  getAllTagsController,
  createTagController,
  updateTourTagsController,
} from "../controllers/tag.controllers";

const router = Router();

// get all tags
router.get("/", getAllTagsController);

// create new tag
router.post("/", createTagController);

// update tour tags
router.put("/tours/:tourId/tags", updateTourTagsController);

export default router;
