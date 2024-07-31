import { Request, Response, Router } from "express";
import prisma from "../prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
    try {
        const tours = await prisma.tour.findMany();
        res.json(tours);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching tours' });
    }
});

router.get("/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const tour = await prisma.tour.findUnique({
            where: { id },
        });
        if (tour) {
            res.json(tour);
        } else {
            res.status(404).json({ error: 'Tour not found' });
        }
    } catch (error) {
        res.status(500);
    }
});

export default router;