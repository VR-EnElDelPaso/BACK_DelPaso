import { z } from "zod";
import prisma from "../prisma";
import { ResponseData } from "../types/ResponseData";
import { Request, Response } from "express";
import { EditMuseumSchema } from "../types/museums/ZodSchemas";
import { emptyBodyResponse, invalidBodyResponse, notFoundResponse, validateEmptyBody, validateIdAndRespond } from "../utils/controllerUtils";

export const getAllMuseumsController = async (req: Request, res: Response) => {
  const museums = await prisma.museum.findMany({ orderBy: { created_at: "desc" } });
  return res.status(200).json({
    ok: true,
    message: "Museums fetched successfully",
    data: museums,
  } as ResponseData);
}

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
        acc[typedKey] = bodyValidation.data[typedKey];
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