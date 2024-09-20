
import { RequestHandler, Request, Response } from "express";

import prisma from "../prisma";
import mpClient from "../mercadopago";
import { createPreference, createPreferences } from "../services/preference.services";
import { ok } from "assert";
import { error } from "console";

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

//
export const createPreferencesController: RequestHandler = async (req: Request, res: Response) => {
  const { cart } = req.body;
  try {
    if (!cart || !Array.isArray(cart) || cart.length === 0) {
      return res.status(400).json({ ok: false, error: "Empty cart." });
    }

    const toursId = cart.map(item => item.id);

    const tours = await prisma.tour.findMany({
      where: { id: { in: toursId } }
    });

    if (tours.length !== toursId.length) {
      return res.status(404).json({ ok: false, error: 'One or more tours were not found.' });
    }

    const updatedCart = cart.map(cartItem => {
      const tour = tours.find(t => t.id === cartItem.id);
    
      if (!tour) {
        throw new Error(`Tour with id ${cartItem.id} not found.`);
      }
    
      return {
        id: tour.id,
        name: tour.name,
        price: Number(tour.price),
        quantity: cartItem.quantity,
      };
    });
    
    const preference = await createPreferences(updatedCart, mpClient);
    return res.status(201).json({ ok: true, preferenceId: preference.id });
  } catch (error) {
    console.error('Error creating preference', error);
    return res.status(500).json({ ok: false, error: 'Error creating preference' });
  }
}
