
import { RequestHandler, Request, Response } from "express";

import prisma from "../prisma";
import mpClient from "../mercadopago";
import { createPreference } from "../services/preference.services";

export const createPreferenceController: RequestHandler = async (req: Request, res: Response) => {
  const { tour_id } = req.params;

  try {
    const tour = await prisma.tour.findUnique({ where: { id: tour_id } });
    if (!tour) {
      return res.status(404).json({ ok: false, error: 'Tour not found' });
    }
    
    const preference = await createPreference(tour, mpClient);
    return res.status(201).json({ ok: true, preferenceId: preference.id });
  } catch (error) {
    console.error('Error creating preference', error);
    return res.status(500).json({ ok: false, error: 'Error creating preference' });
  }
}