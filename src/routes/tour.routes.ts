import { Router } from "express";
import { createTourController, deleteTourController, editTourController, getAllToursController, getTourByIdController, getToursFromIds, getTourSuggestions } from '../controllers/tour.controllers';

const router = Router();

// get all
router.get("/", getAllToursController);

// get one
router.get("/:id", getTourByIdController);

// get from array of ids
router.post("/from-array", getToursFromIds);

// get suggestions
router.post("/suggestion", getTourSuggestions);

// create one
router.post("/", createTourController);

// edit one
router.patch("/:id", editTourController);

// delete one
router.delete("/:id", deleteTourController);




export default router;