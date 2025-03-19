import { z } from "zod";
import prisma from "../prisma";
import { ResponseData } from "../types/ResponseData";
import { Request, Response } from "express";
import { emptyBodyResponse, invalidBodyResponse, notFoundResponse, validateEmptyBody, validateIdAndRespond } from "../utils/controllers/controller.utils";
import { CreateMuseumSchema, EditMuseumSchema } from "../validations/museum.validations";
import { createOpenHoursForMuseum, dayReverseMap } from "../utils/museums.utils";

// ----[ CRUD ]----

// Get all museums
export const getAllMuseumsController = async (req: Request, res: Response) => {
  const museums = await prisma.museum.findMany({
    orderBy: { created_at: "desc" },
    include: { open_hours: true } // Incluir la relación con OpenHour
  });

  // Transformar la respuesta para devolver los días en español
  const formattedMuseums = museums.map(museum => ({
    ...museum,
    hours: museum.open_hours.map(hour => ({
      day: dayReverseMap[hour.day], // Convertir enum a texto en español
      isOpen: hour.is_open
    }))
  }));

  return res.status(200).json({
    ok: true,
    message: "Museums fetched successfully",
    data: formattedMuseums,
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

  const formattedMuseum = {
    ...museum,
    hours: museum.open_hours.map(hour => ({
      day: dayReverseMap[hour.day],
      isOpen: hour.is_open
    }))
  };

  return res.status(200).json({
    ok: true,
    message: "Museum fetched successfully",
    data: formattedMuseum,
  } as ResponseData);
};


// Create museum
export const createMuseumController = async (req: Request, res: Response) => {
  const bodyValidation = CreateMuseumSchema.safeParse(req.body);
  if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

  const { hours, ...museumData } = bodyValidation.data;

  try {
    // Crear el museo
    const museum = await prisma.museum.create({ data: museumData });

    if (hours && hours.length > 0) {
      await createOpenHoursForMuseum(museum.id, hours);
    }

    const openHours = await prisma.openHour.findMany({
      where: { museum_id: museum.id },
      select: { day: true, is_open: true }
    });

    const formattedHours = openHours.map(hour => ({
      day: dayReverseMap[hour.day],
      isOpen: hour.is_open
    }));

    return res.status(201).json({
      ok: true,
      message: "Museum created successfully",
      data: {
        ...museum,
        hours: formattedHours // Incluir los horarios en la respuesta
      }
    } as ResponseData);
  } catch (error) {
    console.error("Error creating museum:", error);
    return res.status(500).json({
      ok: false,
      message: "Error creating museum",
    } as ResponseData);
  }
};

// Edit museum
export const editMuseumController = async (req: Request, res: Response) => {
  validateIdAndRespond(res, req.params.id);
  const id = req.params.id;

  const foundMuseum = await prisma.museum.findUnique({ where: { id } });
  if (!foundMuseum) return notFoundResponse(res, "Museum");

  const bodyValidation = EditMuseumSchema.safeParse(req.body);
  if (!bodyValidation.success) return invalidBodyResponse(res, bodyValidation.error);

  if (validateEmptyBody(bodyValidation.data)) return emptyBodyResponse(res);

  const { hours, ...updateFields } = bodyValidation.data; // Extraemos `hours`
  
  // Filtrar solo los campos válidos que no sean `undefined`
  const validFields = Object.keys(updateFields).reduce(
    (acc, key) => {
      const typedKey = key as keyof typeof updateFields;
      if (updateFields[typedKey] !== undefined) {
        acc[typedKey] = updateFields[typedKey] as string | undefined;
      }
      return acc;
    },
    {} as Partial<typeof updateFields>
  );

  const updatedMuseum = await prisma.museum.update({
    where: { id },
    data: validFields, // Ahora `validFields` está bien definido
  });

  // Si se envían horarios, eliminamos los existentes y los reemplazamos
  if (hours && hours.length > 0) {
    await prisma.openHour.deleteMany({ where: { museum_id: id } });
    await createOpenHoursForMuseum(id, hours);
  }

  const updatedOpenHours = await prisma.openHour.findMany({
    where: { museum_id: id },
    select: { day: true, is_open: true }
  });

  const formattedHours = updatedOpenHours.map(hour => ({
    day: dayReverseMap[hour.day],
    isOpen: hour.is_open
  }));

  return res.status(200).json({
    ok: true,
    message: "Museum updated successfully",
    data: {
      ...updatedMuseum,
      hours: formattedHours
    }
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