import { Request, Response, Router } from "express";

import { Preference } from "mercadopago";
import { type  PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";

import mpClient from "../mercadopago";
import prisma from "../prisma";

const router = Router();

router.post("/:tour_id", async (req: Request, res: Response) => {
  const { tour_id } = req.params;

  const tour = await prisma.tour.findUnique({
    where: { id: tour_id },
  });
  if (!tour) {
    return res.status(404).json({ ok: false, error: 'Tour not found' });
  }

  const preferenceData: PreferenceCreateData = {
    body: {
      items: [
        {
          id: tour.id,
          title: tour.name,
          unit_price: Number(tour.price),
          quantity: 1,
        }
      ],
      back_urls: {
        success: 'www.google.com',
        failure: 'www.google.com',
        pending: 'www.google.com',
      }
    }
  }

  const emptyPreference = new Preference(mpClient);
  const preference = await emptyPreference.create(preferenceData);
  
  if (!preference) return res.status(500).json({ ok: false, error: 'Error creating preference' });
  return res.status(201).json({ ok: true, preferenceId: preference.id });
});

export default router;