import { RequestHandler, Request, Response } from "express";
import { ResponseData } from "../types/ResponseData";
import prisma from "../prisma";
import { z } from "zod";

const CreateTagSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
});

const UpdateTourTagsSchema = z.object({
  tagIds: z.array(z.string().uuid()),
});

export const getAllTagsController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const tags = await prisma.tag.findMany();

    return res.status(200).json({
      ok: true,
      message: "Tags fetched successfully",
      data: tags,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error fetching tags",
      errors: (error as any).message,
    } as ResponseData);
  }
};

export const createTagController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const bodyValidation = CreateTagSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        ok: false,
        message: "Invalid request body",
        errors: Object.values(bodyValidation.error.format()).map((err) => Array.isArray(err) ? err : err._errors).flat(),
      } as ResponseData);
    }

    // Verificar si ya existe una etiqueta con el mismo nombre
    const existingTag = await prisma.tag.findUnique({
      where: { name: bodyValidation.data.name },
    });

    if (existingTag) {
      return res.status(400).json({
        ok: false,
        message: "Ya existe una etiqueta con ese nombre",
      } as ResponseData);
    }

    const tag = await prisma.tag.create({
      data: bodyValidation.data,
    });

    return res.status(201).json({
      ok: true,
      message: "Tag created successfully",
      data: tag,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error creating tag",
      errors: (error as any).message,
    } as ResponseData);
  }
};

export const updateTourTagsController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { tourId } = req.params;
    const bodyValidation = UpdateTourTagsSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        ok: false,
        message: "Invalid request body",
        errors: Object.values(bodyValidation.error.format()).map((err) => Array.isArray(err) ? err : err._errors).flat(),
      } as ResponseData);
    }

    // Verificar si el tour existe
    const tour = await prisma.tour.findUnique({
      where: { id: tourId },
    });

    if (!tour) {
      return res.status(404).json({
        ok: false,
        message: "Tour not found",
      } as ResponseData);
    }

    // Verificar que todos los tags existen
    const tags = await prisma.tag.findMany({
      where: { id: { in: bodyValidation.data.tagIds } },
    });

    if (tags.length !== bodyValidation.data.tagIds.length) {
      return res.status(400).json({
        ok: false,
        message: "One or more tags do not exist",
      } as ResponseData);
    }

    // Eliminar todas las relaciones existentes
    await prisma.tourTag.deleteMany({
      where: { tour_id: tourId },
    });

    // Crear las nuevas relaciones
    await prisma.tourTag.createMany({
      data: bodyValidation.data.tagIds.map((tagId) => ({
        tour_id: tourId,
        tag_id: tagId,
      })),
    });

    // Obtener el tour actualizado con sus tags
    const updatedTour = await prisma.tour.findUnique({
      where: { id: tourId },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return res.status(200).json({
      ok: true,
      message: "Tour tags updated successfully",
      data: {
        ...updatedTour,
        tags: updatedTour?.tags.map((t) => t.tag),
      },
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error updating tour tags",
      errors: (error as any).message,
    } as ResponseData);
  }
};
