import { Router } from "express";
import { checkPurchasedTourController, createTourController, deleteTourController, editTourController, getTourUrlController, getAllToursController, getTourByIdController, getToursFromIdsController, getTourSuggestionsController, markTourAsCompletedController } from '../controllers/tour.controllers';
import { authMiddleware, verifyRolesMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

// ----[ CRUD ]----

// get all
router.get("/", getAllToursController);

// get one
router.get("/:id", getTourByIdController);

// create one
router.post("/", [verifyRolesMiddleware(["ADMIN"])], createTourController);

// edit one
router.patch("/:id", [verifyRolesMiddleware(["ADMIN"])], editTourController);

// delete one
router.delete("/:id", verifyRolesMiddleware(["ADMIN"]), deleteTourController);



// ----[ Special routes ]----

// get from array of ids
router.post("/from-array", getToursFromIdsController);

// get suggestions
router.post("/suggestion", getTourSuggestionsController);

// check if user has purchased a tour
router.get("/:id/check-purchase", [authMiddleware], checkPurchasedTourController);

// getTourUrl
router.get("/:id/url", [authMiddleware], getTourUrlController);

// mark tour as completed
router.post("/:id/complete", [authMiddleware], markTourAsCompletedController);



export default router;