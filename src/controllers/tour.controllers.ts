import { RequestHandler, Request, Response } from "express";
import { ResponseData } from '../types/ResponseData';
import prisma from '../prisma';
import { z } from "zod";
import { CreateTourSchema, EditTourSchema } from "../types/tours/ZodSchemas";
import { emptyBodyResponse, invalidBodyResponse, notFoundResponse, validateEmptyBody, validateIdAndRespond } from "../utils/controllerUtils";
import { TourTag } from "@prisma/client";

const IdsSchema = z.array(z.string());

export const getToursFromIds: RequestHandler = async (req: Request, res: Response) => {

  const result = IdsSchema.safeParse(req.body.ids);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid ids',
    } as ResponseData);
  }

  const ids = result.data;

  try {
    const foundTours = await prisma.tour.findMany({
      where: { id: { in: ids } }
    });
    return res.status(200).json({
      ok: true,
      message: 'Tours fetched successfully',
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error fetching tours',
    } as ResponseData);
  }
}

export const getTourSuggestions: RequestHandler = async (req: Request, res: Response) => {
  const { excludedIds, } = req.body;
  const take = parseInt(req.query.take as string) || 10;

  const result = IdsSchema.safeParse(excludedIds);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: 'Invalid excludedIds',
    } as ResponseData);
  }

  const ids = result.data;

  try {
    const foundTours = await prisma.tour.findMany({
      where: { id: { notIn: ids } },
      take
    });
    return res.status(200).json({
      ok: true,
      message: 'Tours suggestions fetched successfully',
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error fetching tours',
    } as ResponseData);
  }
}

export const getAllToursController = async (req: Request, res: Response) => {
  try {
    const { tag } = req.query;

    let tours;
    if (tag && Object.values(TourTag).includes(tag as TourTag)) {
      tours = await prisma.tour.findMany({
        where: { tags: { has: tag as TourTag } },
      });
    } else {
      tours = await prisma.tour.findMany();
    }

    return res.status(200).json({
      ok: true,
      message: "Museums fetched successfully",
      data: tours,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error fetching tours',
    } as ResponseData);
  }
}

export const getTourByIdController = async (req: Request, res: Response) => {
  try {
    const idValidation = z.string().safeParse(req.params.id);
    if (!idValidation.success)
      return res.status(400).json({
        ok: false,
        message: "Invalid id",
        errors: idValidation.error.format(),
      } as unknown as ResponseData);
    const id = idValidation.data;

    const tour = await prisma.tour.findUnique({ where: { id } });

    if (!tour)
      return res.status(404).json({
        ok: false,
        message: "Tour not found",
      } as ResponseData);

    return res.status(200).json({
      ok: true,
      message: "Tour fetched successfully",
      data: tour,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error fetching tour',
      errors: (error as any).message,
    } as ResponseData);
  }
}

export const createTourController = async (req: Request, res: Response) => {
  try {
    const bodyValidation = CreateTourSchema.safeParse(req.body);
    if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

    const { tags, ...tourData } = bodyValidation.data;
    
    const validTags = Object.values(TourTag);
    if (!tags.every(tag => validTags.includes(tag))) {
      return res.status(400).json({
        ok: false,
        message: 'Uno o más tags no son válidos',
      } as ResponseData);
    }

    const tour = await prisma.tour.create({
      data: {
        ...tourData,
        tags,
      }
    });

    return res.status(201).json({
      ok: true,
      message: "Tour created successfully",
      data: tour,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error creating tour',
      errors: (error as any).message,
    } as ResponseData);
  }
}

export const editTourController = async (req: Request, res: Response) => {
  try {
    validateIdAndRespond(res, req.params.id);
    const id = req.params.id;

    // Check if tour exists
    const foundTour = await prisma.tour.findUnique({ where: { id } });
    if (!foundTour) return notFoundResponse(res, "Tour");

    // Validate body
    const bodyValidation = EditTourSchema.safeParse(req.body);
    if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

    // validate at least one field is present
    if (validateEmptyBody(bodyValidation.data)) return emptyBodyResponse(res);

    // filter only valid fields from the body
    const validFields = Object.entries(bodyValidation.data)
      .reduce((acc, [key, value]) => {
        if (value !== undefined) {
          acc[key] = value;
        }
        return acc;
      }, {} as Record<string, any>);

    // Extraer y validar los tags si están en la petición
    let updatedTags = foundTour.tags;
    if (bodyValidation.data.tags) {
      const validTags = Object.values(TourTag);
      if (!bodyValidation.data.tags.every(tag => validTags.includes(tag))) {
        return res.status(400).json({
          ok: false,
          message: 'Uno o más tags no son válidos',
        } as ResponseData);
      }
      updatedTags = bodyValidation.data.tags;
    }

    // Update the tour
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: {
        ...validFields,
        tags: updatedTags, // Usar tags actualizados o mantener los existentes
      }
    });

    // Respond with the updated tour
    return res.status(200).json({
      ok: true,
      message: "Tour updated successfully",
      data: updatedTour,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error updating tour',
      errors: (error as any).message,
    } as ResponseData);
  }
}

export const deleteTourController = async (req: Request, res: Response) => {
  try {
    validateIdAndRespond(res, req.params.id);
    const id = req.params.id;

    // Check if tour exists
    const foundTour = await prisma.tour.findUnique({ where: { id } });
    if (!foundTour) return notFoundResponse(res, "Tour");

    // Delete everything in order:
    // 1. Delete reviews
    await prisma.review.deleteMany({
      where: { tour_id: id }
    });

    // 3. Finally delete the tour
    await prisma.tour.delete({ where: { id } });

    // Respond with success message
    return res.status(200).json({
      ok: true,
      message: "Tour and associated data deleted successfully",
      data: foundTour,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: 'Error deleting tour',
      errors: (error as any).message,
    } as ResponseData);
  }
}