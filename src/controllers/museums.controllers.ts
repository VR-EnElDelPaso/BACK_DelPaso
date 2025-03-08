import { z } from "zod";
import prisma from "../prisma";
import { ResponseData } from "../types/ResponseData";
import { Request, Response } from "express";
import { emptyBodyResponse, invalidBodyResponse, notFoundResponse, validateEmptyBody, validateIdAndRespond } from "../utils/controller.utils";
import { CreateMuseumSchema, EditMuseumSchema } from "../validations/museum.validations";


// ----[ CRUD ]----

// Get all museums
export const getAllMuseumsController = async (req: Request, res: Response) => {
  const museums = await prisma.museum.findMany({ orderBy: { created_at: "desc" } });
  return res.status(200).json({
    ok: true,
    message: "Museums fetched successfully",
    data: museums,
  } as ResponseData);
}

// Get museum by id
export const getMuseumByIdController = async (req: Request, res: Response) => {
  const idValidation = z.string().safeParse(req.params.id);
  if (!idValidation.success)
    return res.status(400).json({
      ok: false,
      message: "Invalid id",
      errors: idValidation.error.format(),
    } as unknown as ResponseData);
  const id = idValidation.data;

  const museum = await prisma.museum.findUnique({ where: { id } });

  if (!museum)
    return res.status(404).json({
      ok: false,
      message: "Museum not found",
    } as ResponseData);

  return res.status(200).json({
    ok: true,
    message: "Museum fetched successfully",
    data: museum,
  } as ResponseData);
}

// Create museum
export const createMuseumController = async (req: Request, res: Response) => {
  const bodyValidation = CreateMuseumSchema.safeParse(req.body);
  if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

  const museum = await prisma.museum.create({ data: bodyValidation.data });
  
  return res.status(201).json({
    ok: true,
    message: "Museum created successfully",
    data: museum,
  } as ResponseData);
}

// Edit museum
export const editMuseumController = async (req: Request, res: Response) => {
  validateIdAndRespond(res, req.params.id);
  const id = req.params.id;

  // Check if museum exists
  const foundMuseum = await prisma.museum.findUnique({ where: { id } });
  if (!foundMuseum) return notFoundResponse(res, "Museum");

  // Validate body
  const bodyValidation = EditMuseumSchema.safeParse(req.body);
  if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

  // validate at least one field is present
  if (validateEmptyBody(bodyValidation.data)) return emptyBodyResponse(res);

  // Filter only valid fields from the body
  const validFields = Object.keys(bodyValidation.data).reduce(
    (acc, key) => {
      const typedKey = key as keyof typeof bodyValidation.data;
      if (bodyValidation.data[typedKey] !== undefined) {
        if (bodyValidation.data[typedKey] !== null) {
          acc[typedKey] = bodyValidation.data[typedKey] as string | undefined;
        }
      }
      return acc;
    },
    {} as Partial<typeof bodyValidation.data>
  );

  // Update museum
  const updatedMuseum = await prisma.museum.update({
    where: { id },
    data: validFields,
  });

  return res.status(200).json({
    ok: true,
    message: "Museum updated successfully",
    data: updatedMuseum,
  } as ResponseData);
};

// Delete museum
export const deleteMuseumController = async (req: Request, res: Response) => {
  validateIdAndRespond(res, req.params.id);
  const id = req.params.id;

  // Check if museum exists
  const foundMuseum = await prisma.museum.findUnique({ where: { id } });
  if (!foundMuseum) return notFoundResponse(res, "Museum");

  // Delete museum
  const deletedMuseum = await prisma.museum.delete({ where: { id } });

  return res.status(200).json({
    ok: true,
    message: "Museum deleted successfully",
    data: deletedMuseum,
  } as ResponseData);
};

// ----[ Sub resources ]----

// Tours
export const getMuseumToursController = async (req: Request, res: Response) => {
  validateIdAndRespond(res, req.params.museum_id);
  const museumId = req.params.museum_id;

  // Check if museum exists
  const foundMuseum = await prisma.museum.findUnique({ where: { id: museumId } });
  if (!foundMuseum) return notFoundResponse(res, "Museum");

  // Get museum tours
  const tours = await prisma.tour.findMany({ where: { museum_id: museumId } });

  return res.status(200).json({
    ok: true,
    message: "Museum tours fetched successfully",
    data: tours,
  } as ResponseData);
};