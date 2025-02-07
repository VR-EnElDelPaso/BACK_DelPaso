import { Router } from "express";
import { mercadopagoListenerController } from "../controllers/webhook.controllers";

const router = Router();

router.post("/mercadopago", mercadopagoListenerController);

export default router;