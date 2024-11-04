import { RequestHandler, Request, Response } from "express";
import { z } from "zod";
import prisma from "../prisma";
import mpClient from "../mercadopago";
import { createPreference, createPreferences} from "../services/preference.services";
import { PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";
import { ResponseData } from '../types/ResponseData';
import { generateAccessToken } from "../utils/generateTokenTour";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";

export const createPreferenceController: RequestHandler = async (req: Request, res: Response) => {
  const { tour_id } = req.params;
  const user_id = (req.user as UserWithoutPassword)?.id;

  try {
    const tour = await prisma.tour.findUnique({ where: { id: tour_id } });
    if (!tour) {
      return res.status(404).json({ ok: false, error: 'Tour not found' });
    }

    const accessToken = generateAccessToken(user_id, [tour_id]);
    const preference = await createPreference(tour, mpClient);
    return res.status(201).json({ ok: true, preferenceId: preference.id, accessToken });
  } catch (error) {
    console.error('Error creating preference', error);
    return res.status(500).json({ ok: false, error: 'Error creating preference' });
  }
}

const ItemIds = z.array(z.string());

export const createPreferencesController: RequestHandler = async (req: Request, res: Response) => {
  const result = ItemIds.safeParse(req.body.item_ids);
  const user_id = (req.user as UserWithoutPassword)?.id;
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid item_ids',
    } as ResponseData);
  }

  const itemIds = result.data;
  try {
    const foundTours = await prisma.tour.findMany({
      where: { id: { in: itemIds } }
    });
    
    if (foundTours.length !== itemIds.length) {
      return res.status(404).json({
        ok: false,
        message: 'One or more tours were not found.'
      } as ResponseData);
    }

    const preferenceItems: PreferenceCreateData["body"]["items"] = foundTours.map(tour => ({
      id: tour.id,
      title: tour.name,
      unit_price: Number(tour.price),
      quantity: 1,
    }));
    const accessToken = generateAccessToken(user_id, itemIds);
    console.log(accessToken);
    const preference = await createPreferences(preferenceItems, mpClient);

    const response: ResponseData = {
      ok: true,
      message: 'Preferences created',
      data: preference.id,
    };
    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creating preferences', error);
    return res.status(500).json({ ok: false, message: 'Error creating preferences', data: error });
  }
}
