import { RequestHandler, Request, Response } from "express";
import prisma from "../prisma";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";

export const createReview: RequestHandler = async (req: Request, res: Response) =>{
    try {
        const { tour_id } = req.params;
        if (!tour_id) {
            return res.status(401).json({ error: 'Tour ID is required' });
        }

        const user_id = (req.user as UserWithoutPassword)?.id;
        if (!user_id) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        const { score, comment } = req.body;
        if (score < 1 || score > 5) {
            return res.status(400).json({ error: 'Score must be between 1 and 5' });
        }
        
        const review = await prisma.review.create({
            data:{
                score,
                comment,
                user: { connect: { id: user_id } },
                tour: { connect: { id: tour_id } },
            }
        });

        res.status(201).json({ ok: true, message: review });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok:false, message: 'Error creating review' });
    }
}

export const getAllReviews: RequestHandler = async(req: Request, res: Response) =>{
    try {
        const reviews = await prisma.review.findMany({
            include: {
              user: true,
              tour: true,
            },
        });
      
        res.status(200).json({ ok: true, message: reviews });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Error fetching reviews' });
    }
}

export const updateReview: RequestHandler = async(req: Request, res: Response) =>{
    try {
        const { id: reviewId } = req.params;

        const { score, comment } = req.body;

        if (score && (score < 1 || score > 5)) {
            return res.status(400).json({ message: 'Score must be between 1 and 5' });
        }

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });
      
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: {
              score: score ?? review.score,
              comment: comment ?? review.comment,
              updated_at: new Date(),
            },
        });
      
        res.status(200).json({ ok: true, message: updatedReview });

    } catch (error) {
        console.error(error);
        res.status(500).json({ ok:false, message: 'Failed to update review' });
    }
}

export const deleteReview: RequestHandler = async(req: Request, res: Response) =>{
    try {
        const { id: reviewId } = req.params;

        const deletedReview = await prisma.review.delete({
            where : { id: reviewId }
        })

        if (!deletedReview) {
            return res.status(404).json({ ok: false, message: 'Review not found' });
        }

        res.status(200).json({ 
            ok: true, 
            message: 'Review deleted successfully', 
            deletedReview 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: 'Failed to delete review' });
    }
}

export const getPaginatedReviews: RequestHandler = async (req: Request, res: Response) => {
    try {
        const { tour_id } = req.params;
        const take = parseInt(req.query.take as string) || 10; // Número de reseñas a obtener
        const skip = parseInt(req.query.skip as string) || 0;  // Número de reseñas a omitir

        if (!tour_id) {
            return res.status(400).json({ ok: false, message: "Tour ID is required" });
        }

        // Consultar las reseñas con paginación
        const reviews = await prisma.review.findMany({
            where: { tour_id },
            take,
            skip,
            orderBy: { created_at: "desc" }, // Opcional: ordenar por fecha de creación
            include: {
                user: { select: { id: true, name: true, display_name: true, image: true } }, // Incluir datos del usuario
            },
        });

        // Contar el total de reseñas para ese tour
        const totalReviews = await prisma.review.count({
            where: { tour_id },
        });

        res.status(200).json({
            ok: true,
            data: {
                reviews,
                total: totalReviews,
                take,
                skip,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ ok: false, message: "Failed to fetch reviews" });
    }
};
