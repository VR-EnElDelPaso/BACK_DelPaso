import { Request, Response } from "express";
import { Payment } from "mercadopago";
import mpClient from "../mercadopago";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import prisma from "../prisma";
import { PaymentStatus, Tour } from "@prisma/client";

// todo: adapt all to orders logic

export const webHookListenerController = async (req: Request, res: Response) => {
  const { body } = req;
  console.log("notification received: ", body);

  // Es necesario retornar un 200 para que Mercado Pago no siga enviando la notificación
  if (body.action !== "payment.created") return res.send("Webhook received");

  // Buscar el pago en la API de Mercado Pago
  const payment = new Payment(mpClient);
  const paymentInfo: PaymentResponse = await payment.get({
    id: body.data.id
  })

  // validar que el pago exista
  if (!paymentInfo) res.send("Webhook received");
  console.log("Payment info: ", {
    id: paymentInfo.id,
    status: paymentInfo.status,
    external_reference: paymentInfo.external_reference,
    additional_info: paymentInfo.additional_info?.items
  });

  // validar validez de la orden
  const foundOrder = await prisma.order.findUnique({ where: { id: paymentInfo.external_reference } });
  if (!foundOrder) res.send("Webhook received");
  console.log("Order found: ", foundOrder);

  if (paymentInfo.status === "approved") {
    const updatedOrder = await prisma.order.update({
      where: { id: paymentInfo.external_reference },
      data: { status: "COMPLETED" }
    })
    console.log("Order updated: ", updatedOrder);
    return res.send("Webhook received");
  }

  if (paymentInfo.status === "in_process" || paymentInfo.status === "pending") {
    const updatedOrder = await prisma.order.update({
      where: { id: paymentInfo.external_reference },
      data: { status: "PENDING" }
    })
    console.log("Order updated: ", updatedOrder);
    return res.send("Webhook received");
  }

  return res.send("Webhook received");
}

export const isPaymentExists = async (paymentId: string) => {
  const foundPayment = await prisma.payment.findUnique({ where: { mercad_pago_id: paymentId } });
  return !!foundPayment;
}

export const validateTourIds = async (tourIds: string[]) => {
  const foundTours = await prisma.tour.findMany({ where: { id: { in: tourIds } } });
  return foundTours.length === tourIds.length;
}

export const validateUserId = (userId: string) => {
  const foundUser = prisma.user.findUnique({ where: { id: userId } });
  return !!foundUser;
};