import { Router } from "express";
import { createOneOrderController, getOneOrderController, getOrdersByUserController, patchOrderController } from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middlewares";

const router = Router();

// ----[ CRUD ]----
router.get("/:order_id", getOneOrderController);
router.post("/", [authMiddleware], createOneOrderController);
router.patch("/:order_id", patchOrderController);

// ----[ Special ]----
router.get("/by-user/:user_id", getOrdersByUserController);

export default router;