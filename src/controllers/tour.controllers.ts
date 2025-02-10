import { RequestHandler, Request, Response } from "express";
import { ResponseData } from "../types/ResponseData";
import prisma from "../prisma";
import { z } from "zod";
import { CreateTourSchema, EditTourSchema } from "../types/tours/ZodSchemas";
import {
  emptyBodyResponse,
  invalidBodyResponse,
  notFoundResponse,
  validateEmptyBody,
  validateIdAndRespond,
} from "../utils/controllerUtils";

const IdsSchema = z.array(z.string());

export const getToursFromIds: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const result = IdsSchema.safeParse(req.body.ids);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid ids",
    } as ResponseData);
  }

  const ids = result.data;

  try {
    const foundTours = await prisma.tour.findMany({
      where: { id: { in: ids } },
    });
    return res.status(200).json({
      ok: true,
      message: "Tours fetched successfully",
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error fetching tours",
    } as ResponseData);
  }
};

export const getTourSuggestions: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { excludedIds } = req.body;
  const take = parseInt(req.query.take as string) || 10;

  const result = IdsSchema.safeParse(excludedIds);

  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid excludedIds",
    } as ResponseData);
  }

  const ids = result.data;

  try {
    const foundTours = await prisma.tour.findMany({
      where: { id: { notIn: ids } },
      take,
    });
    return res.status(200).json({
      ok: true,
      message: "Tours suggestions fetched successfully",
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error fetching tours",
    } as ResponseData);
  }
};

export const getAllToursController = async (req: Request, res: Response) => {
  try {
    const { tag } = req.query;

    let tours;
    if (tag) {
      tours = await prisma.tour.findMany({
        where: {
          tags: {
            some: {
              tag: {
                name: tag as string, // Filtra tours que tengan el tag solicitado
              },
            },
          },
        },
        include: {
          tags: {
            include: {
              tag: true, // Devuelve el objeto completo del `Tag`
            },
          },
        },
      });
    } else {
      tours = await prisma.tour.findMany({
        include: {
          tags: {
            include: {
              tag: true, // Devuelve el objeto completo del `Tag`
            },
          },
        },
      });
    }

    // Formatear la respuesta para estructurar mejor los datos
    const formattedTours = tours.map((tour) => ({
      ...tour,
      tags: tour.tags.map((t) => t.tag), // Extrae los objetos completos de `Tag`
    }));

    return res.status(200).json({
      ok: true,
      message: "Tours fetched successfully",
      data: formattedTours,
    });
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error fetching tours",
      errors: (error as any).message,
    });
  }
};

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

    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    if (!tour)
      return res.status(404).json({
        ok: false,
        message: "Tour not found",
      } as ResponseData);

    // Formatear la respuesta para estructurar mejor los datos
    const formattedTour = {
      ...tour,
      tags: tour.tags.map((t) => t.tag), // Extrae los objetos completos de Tag
    };

    return res.status(200).json({
      ok: true,
      message: "Tour fetched successfully",
      data: formattedTour,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error fetching tour",
      errors: (error as any).message,
    } as ResponseData);
  }
};

export const createTourController = async (req: Request, res: Response) => {
  try {
    const bodyValidation = CreateTourSchema.safeParse(req.body);
    if (!bodyValidation.success)
      return invalidBodyResponse(res, bodyValidation.error);

    const { tags, ...tourData } = bodyValidation.data;

    // Crear el tour con sus tags
    const tour = await prisma.tour.create({
      data: {
        ...tourData,
        tags: tags
          ? {
              create: tags.map((tagId) => ({
                tag: {
                  connect: { id: tagId },
                },
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });

    return res.status(201).json({
      ok: true,
      message: "Tour created successfully",
      data: {
        ...tour,
        tags: tour.tags.map((t) => t.tag),
      },
    } as ResponseData);
  } catch (error) {
    console.error("Error creating tour:", error);
    return res.status(500).json({
      ok: false,
      message: "Error creating tour",
      errors: (error as any).message,
    } as ResponseData);
  }
};

export const editTourController = async (req: Request, res: Response) => {
  try {
    validateIdAndRespond(res, req.params.id);
    const id = req.params.id;

    // Check if tour exists
    const foundTour = await prisma.tour.findUnique({ where: { id } });
    if (!foundTour) return notFoundResponse(res, "Tour");

    const { tags, ...tourData } = req.body;

    // Procesamos los tags si existen
    if (tags) {
      // Extraemos los IDs sin importar si recibimos objetos completos o solo IDs
      const tagIds = tags.map((tag: string | { id: string }) =>
        typeof tag === "string" ? tag : tag.id
      );

      // Eliminamos las relaciones existentes
      await prisma.tourTag.deleteMany({
        where: { tour_id: id },
      });

      // Creamos las nuevas relaciones
      if (tagIds.length > 0) {
        interface TagIdData {
          tour_id: string;
          tag_id: string;
        }

        await prisma.tourTag.createMany({
          data: tagIds.map(
            (tagId: string): TagIdData => ({
              tour_id: id,
              tag_id: tagId,
            })
          ),
        });
      }
    }

    // Actualizamos el tour
    const updatedTour = await prisma.tour.update({
      where: { id },
      data: tourData,
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
      message: "Tour updated successfully",
      data: {
        ...updatedTour,
        tags: updatedTour.tags.map((t) => t.tag),
      },
    });
  } catch (error) {
    console.error("Error updating tour:", error);
    return res.status(500).json({
      ok: false,
      message: "Error updating tour",
      errors: (error as any).message,
    });
  }
};

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
      where: { tour_id: id },
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
      message: "Error deleting tour",
      errors: (error as any).message,
    } as ResponseData);
  }
};
