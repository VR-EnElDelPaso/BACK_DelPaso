import { RequestHandler ,Request, Response } from "express";
import prisma from "../prisma";
import mpClient from "../mercadopago"; 
import { generateAccessToken } from "../utils/generateTokenTour";
import { user_tour_purchase } from "@prisma/client";

/*export const handlePaymentWebhook: RequestHandler = async (req, res) => {
  const secretKey = req.headers['x-hook-secret'] || req.query.token; // MercadoPago puede enviarlo en headers o query
  const expectedKey = process.env.MP_WEBHOOK_TOKEN; // La clave que definiste en tu .env

  // Valida la clave secreta
  if (secretKey !== expectedKey) {
    console.error("Unauthorized webhook call: Invalid secret key");
    return res.status(401).send("Unauthorized");
  }

  console.log("Headers:", req.headers);
  console.log("Query Params:", req.query);


  console.log("Webhook data received:", req.body);

  const data = req.body;

  if (data.action === "payment") {
    const paymentData = data.data;

    if (paymentData.status === "approved") {
      const { user_id, tour_id } = paymentData.additional_info;

      try {
        const accessToken = generateAccessToken(user_id, [tour_id]);

        console.log("Generated Access Token:", accessToken);

        const newPurchase = await prisma.user_tour_purchase.create({
          data: {
            user_id,
            tour_id,
          },
        });

        return res.status(200).json({
          ok: true,
          message: "Payment approved and registered",
          data: newPurchase,
          accessToken,
        });
      } catch (error) {
        console.error("Error processing payment:", error);
        return res.status(500).json({
          ok: false,
          message: "Error processing payment",
        });
      }
    }
  }

  res.status(200).send("OK");
};*/

export const handlePaymentWebhook: RequestHandler = async (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Token recibido:", req.headers['x-token']);
  console.log("Token esperado:", process.env.MP_WEBHOOK_TOKEN);

  const secretKey = req.headers['x-token'];
  const expectedKey = process.env.MP_WEBHOOK_TOKEN;

  if (secretKey !== expectedKey) {
    console.error("Unauthorized webhook call: Invalid token");
    return res.status(401).send("Unauthorized");
  }

  console.log("Webhook data received:", req.body);
  res.status(200).send("Webhook received");
};
