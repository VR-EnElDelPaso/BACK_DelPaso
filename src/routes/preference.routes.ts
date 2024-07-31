import { Request, Response, Router } from "express";

import prisma from "../prisma";
import { CreatePreference } from "../controllers/preference.controllers";

const router = Router();

router.post("/:tour_id", async (req: Request, res: Response) => {
  const { tour_id } = req.params;

  const tour = await prisma.tour.findUnique({ where: { id: tour_id } });
  if (!tour) {
    return res.status(404).json({ ok: false, error: 'Tour not found' });
  }

  const preference = await CreatePreference(tour);

  if (!preference) return res.status(500).json({ ok: false, error: 'Error creating preference' });
  return res.status(201).json({ ok: true, preferenceId: preference.id });
});

export default router;