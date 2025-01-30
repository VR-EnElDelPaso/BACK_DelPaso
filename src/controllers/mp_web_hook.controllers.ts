import { Request, Response } from "express";
import { Payment } from "mercadopago";
import mpClient from "../mercadopago";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import prisma from "../prisma";
import { PaymentStatus, Tour } from "@prisma/client";

// todo: adapt all to orders logic

export const webHookListenerController = async (req: Request, res: Response) => {
  const { body } = req;
  console.log("Webhook received: ", body);

  // if (body.action !== "payment.created") res.send("Webhook received");

  // const payment = new Payment(mpClient);
  // const paymentInfo: PaymentResponse = await payment.get({
  //   id: body.data.id
  // })

  // if(!paymentInfo) res.send("Webhook received");
  // if (!validateUserId(paymentInfo.external_reference as string)) res.send("Webhook received");
  // const items = paymentInfo.additional_info?.items
  // const itemIds = items?.map((item) => item.id);
  // if (!validateTourIds(itemIds ?? [])) res.send("Webhook received");
  
  // const paymentFound = await isPaymentExists(paymentInfo.id?.toString() ?? "");
  // if (paymentFound) {
  //   const paymentUpdated = await prisma.payment.update({
  //     where: { payment_id: paymentInfo.id?.toString() ?? "" },
  //     data: {
  //       status: paymentInfo.status as PaymentStatus
  //     }
  //   })
  //   console.log("Payment updated: ", paymentUpdated);
  //   return res.send("Webhook received");
  // }

  // const createdPayment = await prisma.payment.create({
  //   data: {
  //     // user_id: paymentInfo.external_reference as string,
  //     mercad_pago_id: paymentInfo.id?.toString() ?? "",
  //     status: paymentInfo.status as PaymentStatus,

  //   }
  // })
  // console.log("Payment created: ", createdPayment);
  // return res.send("Webhook received");
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