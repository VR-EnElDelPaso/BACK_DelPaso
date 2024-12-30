import { Request, Response, Router } from "express";
import prisma from "../prisma";
import { createTourController, getAllToursController, getTourByIdController, getToursFromIds, getTourSuggestions } from '../controllers/tour.controllers';

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




export default router;