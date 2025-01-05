import { RequestHandler, Request, Response } from "express";
import { ResponseData } from '../types/ResponseData';
import prisma from '../prisma';
import { z } from "zod";
import { CreateTourSchema, EditTourSchema } from "../types/tours/ZodSchemas";
import { emptyBodyResponse, invalidBodyResponse, notFoundResponse, validateEmptyBody, validateIdAndRespond } from "../utils/controllerUtils";

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
    const tours = await prisma.tour.findMany();
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

    const tour = await prisma.tour.create({ data: bodyValidation.data });

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
    const validFields = Object.keys(bodyValidation.data).reduce(
      (acc: Partial<Record<keyof typeof bodyValidation.data, string | number>>, key) => {
        const typedKey = key as keyof typeof bodyValidation.data;
        if (bodyValidation.data[typedKey] !== undefined) {
          acc[typedKey] = bodyValidation.data[typedKey] as any;
        }
        return acc;
      },
      {} as Partial<typeof bodyValidation.data>
    ) as any;

    // Update the tour
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: validFields,
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

    // 2. Delete purchase records
    await prisma.user_tour_purchase.deleteMany({
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