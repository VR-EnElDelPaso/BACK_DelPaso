import { Request, Response } from "express";
import { Payment } from "mercadopago";
import mpClient from "../mercadopago";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import prisma from "../prisma";
import { PaymentStatus} from "@prisma/client";
import { ResponseData } from "../types/ResponseData";
import { paymentStatusHandler } from "../utils/PaymentNotificationHandlers";

export const mercadopagoListenerController = async (req: Request, res: Response) => {
  const { body } = req;
  console.log("notification received: ", body);

  if (body.type !== "payment") return res.status(200).json({
    ok: true,
    message: "Notification received"
  } as ResponseData);

  const paymentId = body.data.id;
  const paymentApi = new Payment(mpClient);

  try {
    const paymentInfo = await paymentApi.get({id: paymentId});
    const foundOrder = await prisma.order.findUnique({ where: { id: paymentInfo.external_reference } });
    if (!foundOrder) return res.status(200).json({
      ok: true,
      message: "Notification received"
    } as ResponseData);
    paymentStatusHandler(paymentInfo.status as PaymentStatus, foundOrder);
  } catch (error) {
    console.error("Failed to fetch payment info:", error);
  } finally {
    return res.status(200).json({
      ok: true,
      message: "Notification received"
    } as ResponseData);
  }
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