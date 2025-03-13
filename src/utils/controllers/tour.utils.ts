import { Order, Tour } from "@prisma/client";
import UserWithoutPassword from "../../types/auth/UserWithoutPassword";
import prisma from "../../prisma";

export const isPurchasedTour = async (tour: Tour, user: UserWithoutPassword): Promise<boolean> => {
  const foundOrder = await prisma.order.findFirst({
    where: {
      user_id: user.id,
      tours: { some: { id: tour.id } },
      status: { in: ["COMPLETED", "PENDING"] },
    },
    include: {
      TourAccessToken: {
        where: {
          tour_id: tour.id,
          expires_at: {
            lt: new Date() // check if token is expired
          }
        }
      },
    },
    orderBy: {
      created_at: 'desc',
    },
  });

  return (!foundOrder || foundOrder.TourAccessToken.length > 0)
}

export const getCurrentOrder = async (tour: Tour, user: UserWithoutPassword) => {
  const foundOrder = await prisma.order.findFirst({
    where: {
      user_id: user.id,
      tours: { some: { id: tour.id } },
      status: { in: ["COMPLETED", "PENDING"] },
    },
    orderBy: {
      created_at: 'desc',
    },
  });
  return foundOrder;
}

export const hasOrderExpiredToken = async (orderId: string, tourId: string): Promise<boolean> => {
  const foundToken = await prisma.tourAccess.findFirst({
    where: {
      order_id: orderId,
      tour_id: tourId,
      expires_at: {
        lt: new Date()
      }
    }
  });
  return !!foundToken;
}