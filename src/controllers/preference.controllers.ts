import { RequestHandler, Request, Response } from "express";
import { z } from "zod";
import prisma from "../prisma";
import mpClient from "../mercadopago";
import { createPreference, createPreferences } from "../services/preference.services";
import { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";
import { ResponseData } from '../types/ResponseData';
import { generateAccessToken } from "../utils/generateTokenTour";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";
import { invalidBodyResponse, notFoundResponse } from "../utils/controller.utils";

const PostBodyValidation = z.object({
  order_id: z.string().uuid(),
});

export const createPreferenceController: RequestHandler = async (req: Request, res: Response<ResponseData>) => {
  // Validate body
  const bodyValidation = PostBodyValidation.safeParse(req.body);
  if (!bodyValidation.success)
    return invalidBodyResponse(res, bodyValidation.error);
  const orderId = bodyValidation.data.order_id;

  try {
    // Find order
    const foundOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { tours: true },
    });
    if (!foundOrder) return notFoundResponse(res, 'Order');

    // Create preference
    const tours = foundOrder.tours;
    const preferenceItems: PreferenceCreateData["body"]["items"] = tours.map(tour => ({
      id: tour.id,
      title: tour.name,
      unit_price: Number(tour.price),
      quantity: 1,
    }));
    const preference = await createPreferences(preferenceItems, foundOrder.id, mpClient);

    // return preference
    return res.status(201).json({
      ok: true,
      message: 'Preference created',
      data: {
        id: preference.id,
        init_point: preference.init_point,
        external_reference: preference.external_reference,
      }
    });
  } catch (error) {
    console.error('Error creating preference', error);
    return res.status(500).json({
      ok: false,
      message: 'Error creating preference',
      errors: ['Error creating preference'],
    });
  }
}


// export const createPreferencesController: RequestHandler = async (req: Request, res: Response) => {
//   const orderIdValidation = OrderIdValidation.safeParse(req.body.order_id);
//   const userId = (req.user as UserWithoutPassword)?.id;

//   if (!orderIdValidation.success)
//     invalidBodyResponse(res, orderIdValidation.error);
//   const orderId = orderIdValidation.data;

//   try {

//     const preferenceItems: PreferenceCreateData["body"]["items"] = foundTours.map(tour => ({
//       id: tour.id,
//       title: tour.name,
//       unit_price: Number(tour.price),
//       quantity: 1,
//     }));
//     const preference = await createPreferences(preferenceItems, userId, mpClient);
//     console.log('init ', preference.init_point, preference.sandbox_init_point);

//     console.log('Preference created', preference);

//     const response: ResponseData = {
//       ok: true,
//       message: 'Preferences created',
//       data: preference.id,
//     };
//     return res.status(201).json(response);
//   } catch (error) {
//     console.error('Error creating preferences', error);
//     return res.status(500).json({ ok: false, message: 'Error creating preferences', data: error });
//   }
// }
