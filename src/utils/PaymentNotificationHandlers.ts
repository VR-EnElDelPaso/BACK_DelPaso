import { Order, PaymentStatus } from "@prisma/client";
import prisma from "../prisma";

export const paymentStatusHandler = async (paymentStatus: PaymentStatus, order: Order) => {
  switch (paymentStatus) {
    case "approved":
      return await prisma.order.update({
        where: { id: order.id },
        data: { status: "COMPLETED", completed_at: new Date()}
      });
    case "pending":
    case "in_process":
      return await prisma.order.update({
        where: { id: order.id },
        data: { status: "PENDING" }
      });
    case "rejected":
    case "cancelled":
    case "refunded":
    case "charged_back":
      return await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", cancelled_at: new Date() }
      });
    default:
      return;
  }
}
