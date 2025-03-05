import { Router } from "express";
import { createTourController, deleteTourController, editTourController, getAllToursController, getTourByIdController, getToursFromIdsController, getTourSuggestionsController } from '../controllers/tour.controllers';
import { verifyRolesMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

// get all
router.get("/", getAllToursController);

// get one
router.get("/:id", getTourByIdController);

// get from array of ids
router.post("/from-array", getToursFromIdsController);

// get suggestions
router.post("/suggestion", getTourSuggestionsController);

// create one
router.post("/", [verifyRolesMiddleware(["ADMIN"])], createTourController);

// edit one
router.patch("/:id", [verifyRolesMiddleware(["ADMIN"])], editTourController);

// delete one
router.delete("/:id", verifyRolesMiddleware(["ADMIN"]), deleteTourController);




export default router;