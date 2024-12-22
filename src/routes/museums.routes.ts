import { Router } from "express";
import { get } from "http";
import { editMuseumController, getAllMuseumsController, getMuseumByIdController } from "../controllers/museums.controllers";

const router = Router();

router.get("/", getAllMuseumsController);
router.get("/:id", getMuseumByIdController);
router.patch("/:id", editMuseumController);

export default router;