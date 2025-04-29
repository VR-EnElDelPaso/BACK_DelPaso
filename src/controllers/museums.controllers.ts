import { z } from "zod";
import prisma from "../prisma";
import { ResponseData } from "../types/ResponseData";
import { Request, Response } from "express";
import { emptyBodyResponse, invalidBodyResponse, notFoundResponse, validateEmptyBody, validateIdAndRespond } from "../utils/controllers/controller.utils";
import { CreateMuseumSchema, EditMuseumSchema, HoursSchema } from "../validations/museum.validations";
import { dayReverseMap, museumSerializer } from "../utils/museums.utils";
import { Day } from "@prisma/client";

// ----[ CRUD ]----

// Get all museums
export const getAllMuseumsController = async (req: Request, res: Response) => {
  const museums = await prisma.museum.findMany({
    orderBy: { created_at: "desc" },
    include: { open_hours: true }
  });

  const formatted = await Promise.all(museums.map(async museum => await museumSerializer(museum)));

  return res.status(200).json({
    ok: true,
    message: "Museos con horarios formateados",
    data: formatted
  } as ResponseData);
};

// Get museum by id
export const getMuseumByIdController = async (req: Request, res: Response) => {
  const idValidation = z.string().safeParse(req.params.id);
  if (!idValidation.success) {
    // Extraer errores como un array de strings
    const errorMessages = Object.values(idValidation.error.format()).flat() as string[];

    return res.status(400).json({
      ok: false,
      message: "Invalid id",
      errors: errorMessages,
    } as ResponseData);
  }

  const id = idValidation.data;

  const museum = await prisma.museum.findUnique({
    where: { id },
    include: { open_hours: true }
  });

  if (!museum) {
    return res.status(404).json({
      ok: false,
      message: "Museum not found",
    } as ResponseData);
  }

  const formattedMuseum = await museumSerializer(museum)

  return res.status(200).json({
    ok: true,
    message: "Museum fetched successfully",
    data: formattedMuseum,
  } as ResponseData);
};


// Create museum
export const createMuseumController = async (req: Request, res: Response) => {
  const museumValidation = CreateMuseumSchema.safeParse(req.body);
  if (!museumValidation.success) return invalidBodyResponse(res, museumValidation.error);

  let createdMuseum = null;
  try {
    createdMuseum = await prisma.museum.create({
      data: museumValidation.data
    });
  } catch (error) {
    console.error("Error creating museum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error creating museum"
    } as ResponseData);
  }

  let createdOpenHours: z.infer<typeof HoursSchema>[] = [];

  if (req.body.hours) {
    const hoursValidation = HoursSchema.safeParse(req.body.hours);
    if (!hoursValidation.success) return invalidBodyResponse(res, hoursValidation.error);
    try {
      await prisma.openHour.createMany({
        data: hoursValidation.data.map(hour => ({
          museum_id: createdMuseum.id,
          day: hour.day as Day,
          is_open: hour.isOpen,
          open_time: hour.openTime,
          close_time: hour.closeTime
        }))
      });
      createdOpenHours = [hoursValidation.data]
    } catch (error) {
      await prisma.museum.delete({ where: { id: createdMuseum.id } });
      console.error("Error creating open hours:", error);
      return res.status(500).json({
        ok: false,
        message: "Error creating open hours"
      } as ResponseData);
    }
  }

  return res.status(200).json({
    ok: true,
    message: "Museum created successfully",
    data: {
      ...museumValidation.data,
      hours: createdOpenHours
    }
  } as ResponseData);
};

// Edit museum
export const editMuseumController = async (req: Request, res: Response) => {
  validateIdAndRespond(res, req.params.id);
  const id = req.params.id;

  const foundMuseum = await prisma.museum.findUnique({ where: { id } });
  if (!foundMuseum) return notFoundResponse(res, "Museum");

  const museumValidation = EditMuseumSchema.safeParse(req.body);
  if (!museumValidation.success) return invalidBodyResponse(res, museumValidation.error);

  if (validateEmptyBody(museumValidation.data)) return emptyBodyResponse(res);

  // Filtrar solo los campos válidos que no sean `undefined`
  const validFields = Object.fromEntries(
    Object.entries(museumValidation.data).filter(([_, value]) => value !== undefined)
  );

  if (validFields?.main_tour_id) {
    const foundTour = await prisma.tour.findUnique({ where: { id: String(validFields.main_tour_id) } });
    if (!foundTour) return notFoundResponse(res, "Main tour");
  }


  let updatedMuseum = null;
  try {
    updatedMuseum = await prisma.museum.update({
      where: { id },
      data: validFields,
    });
  } catch (error) {
    console.error("Error updating museum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error updating museum",
    } as ResponseData);
  }

  if (req.body.hours) {
    const hoursValidation = HoursSchema.safeParse(req.body.hours);
    if (!hoursValidation.success) return invalidBodyResponse(res, hoursValidation.error);
    try {
      await prisma.openHour.deleteMany({ where: { museum_id: id } });
      await prisma.openHour.createMany({
        data: hoursValidation.data.map(hour => ({
          museum_id: id,
          day: hour.day as Day,
          is_open: hour.isOpen,
          open_time: hour.openTime,
          close_time: hour.closeTime
        }))
      });
    } catch (error) {
      console.error("Error updating open hours:", error);
      return res.status(500).json({
        ok: false,
        message: "Error updating open hours",
      } as ResponseData);
    }

    return res.status(200).json({
      ok: true,
      message: "Museum updated successfully",
      data: {
        ...updatedMuseum,
        hours: hoursValidation.data
      }
    } as ResponseData);
  }
};

// Delete museum
export const deleteMuseumController = async (req: Request, res: Response) => {
  validateIdAndRespond(res, req.params.id);
  const id = req.params.id;

  // Check if museum exists
  const foundMuseum = await prisma.museum.findUnique({ where: { id } });
  if (!foundMuseum) return notFoundResponse(res, "Museum");

  // Delete museum
  await prisma.openHour.deleteMany({ where: { museum_id: id } });
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