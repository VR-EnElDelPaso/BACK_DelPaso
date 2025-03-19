import { RequestHandler, Request, Response } from "express";
import { ResponseData } from "../types/ResponseData";
import prisma from "../prisma";
import { z } from "zod";
import {
  invalidBodyResponse,
  isAdminUser,
  notFoundResponse,
  operationErrorResponse,
  validateIdAndRespond,
} from "../utils/controllers/controller.utils";
import { CreateTourSchema, IdsSchema } from "../validations/tour.validations";
import { TourWithoutUrlSelectQuery, TourWithUrlSelectQuery } from "../querys/tour.querys";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";
import { generateTourAccessToken } from "../utils/generateTokenTour";
import { getCurrentOrder, hasOrderExpiredAccess } from '../utils/controllers/tour.utils';
import { Decimal } from "@prisma/client/runtime/library";



// ----[ CRUD methods ]----

export const getAllToursController = async (req: Request, res: Response) => {
  try {
    const { tag } = req.query;

    const tours = await prisma.tour.findMany({
      where: tag ? { tags: { some: { tag: { name: tag as string } } } } : {},
      select: isAdminUser(req) ? TourWithUrlSelectQuery : TourWithoutUrlSelectQuery,
      orderBy: { created_at: "desc" },
    });

    const formattedTours = tours.map((tour) => ({
      ...tour,
      tags: tour.tags.map((t) => t.tag),
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
      select: isAdminUser(req) ? TourWithUrlSelectQuery : TourWithoutUrlSelectQuery,
    });

    if (!tour)
      return res.status(404).json({
        ok: false,
        message: "Tour not found",
      } as ResponseData);

    // Formatear la respuesta para estructurar mejor los datos
    const formattedTour = {
      ...tour,
      tags: tour.tags.map((t) => ({ id: t.tag })), // Extrae los IDs de Tag
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

    // validate museum_id
    const foundMuseum = await prisma.museum.findUnique({
      where: { id: tourData?.museum_id },
    });
    if (!foundMuseum)
      return res.status(404).json({
        ok: false,
        message: "Museum not found",
      } as ResponseData);

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
      select: TourWithUrlSelectQuery,
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
      select: TourWithUrlSelectQuery,
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
    const foundTour = await prisma.tour.findUnique({ where: { id }, select: TourWithUrlSelectQuery });
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



// ----[ Other methods ]---

/**
 * Retrieves a list of tours based on an array of IDs provided in the request body.
 * 
 * - **ID Validation**: The IDs provided in the request body (`req.body.ids`) are validated
 *   using a schema (`IdsSchema`) to ensure they are valid.
 * - **Tour Query**: If the IDs are valid, a database query is performed to fetch the corresponding tours.
 *   Only the fields defined in `TourSelectQuery` are selected.
 * - **Response**: If the query is successful, the list of tours is returned. In case of an error,
 *   an appropriate error message is returned.
 */
export const getToursFromIdsController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  // Validate the IDs provided in the request body
  const result = IdsSchema.safeParse(req.body.ids);

  // If validation fails, return a 400 error
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid ids",
    } as ResponseData);
  }

  // Extract the validated IDs
  const ids = result.data;

  try {
    // Find the tours corresponding to the provided IDs
    const foundTours = await prisma.tour.findMany({
      where: { id: { in: ids } }, // Filter tours by IDs
      select: isAdminUser(req) ? TourWithUrlSelectQuery : TourWithoutUrlSelectQuery,
    });

    // Return a successful response with the found tours
    return res.status(200).json({
      ok: true,
      message: "Tours fetched successfully",
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    // Handle unexpected errors and return a 500 error
    return res.status(500).json({
      ok: false,
      message: "Error fetching tours",
    } as ResponseData);
  }
};

/**
 * Retrieves a list of tour suggestions, excluding tours with specific IDs provided in the request body.
 * 
 * - **Excluded IDs**: The `excludedIds` array in the request body specifies which tours should be excluded
 *   from the suggestions. These IDs are validated using `IdsSchema`.
 * - **Pagination**: The `take` query parameter controls the number of suggestions to return (default is 10).
 * - **Response**: If the query is successful, the list of suggested tours is returned. In case of an error,
 *   an appropriate error message is returned.
 */
export const getTourSuggestionsController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  // Extract `excludedIds` from the request body and `take` from the query parameters
  const { excludedIds } = req.body;
  const take = parseInt(req.query.take as string) || 10; // Default to 10 if `take` is not provided

  // Validate the `excludedIds` array
  const result = IdsSchema.safeParse(excludedIds);

  // If validation fails, return a 400 error
  if (!result.success) {
    return res.status(400).json({
      ok: false,
      message: "Invalid excludedIds",
    } as ResponseData);
  }

  // Extract the validated IDs
  const ids = result.data;

  try {
    // Fetch tour suggestions, excluding the provided IDs and limiting the results to `take`
    const foundTours = await prisma.tour.findMany({
      where: { id: { notIn: ids } }, // Exclude tours with the specified IDs
      select: isAdminUser(req) ? TourWithUrlSelectQuery : TourWithoutUrlSelectQuery,
      take,                          // Limit the number of results
    });

    // Return a successful response with the suggested tours
    return res.status(200).json({
      ok: true,
      message: "Tours suggestions fetched successfully",
      data: foundTours,
    } as ResponseData);
  } catch (error) {
    // Handle unexpected errors and return a 500 error
    return res.status(500).json({
      ok: false,
      message: "Error fetching tours",
    } as ResponseData);
  }
};

/**
 * checkPurchasedTourController - Controller to check if a tour has been purchased by the authenticated user.
 * It verifies if the tour exists and if there is a completed or pending order associated with the tour and the user.
 * If the tour is not found, it returns a 404 error. If the tour has not been purchased, it returns a 404 error with a message.
 * If the tour has been purchased, it returns the tour and order details.
 *
 * @param {Request} req - The Express request object. It expects the tour ID in `req.params.id` and the authenticated user in `req.user`.
 * @param {Response} res - The Express response object.
 * @returns {Promise<Response>} - A response with the status code and a JSON object with the result.
 */
export const checkPurchasedTourController: RequestHandler = async (req: Request, res: Response): Promise<Response> => {
  const user = req.user as UserWithoutPassword;

  // Validate if the tour exists
  const foundTour = await prisma.tour.findUnique({
    where: { id: req?.params?.id },
  });
  if (!foundTour) return notFoundResponse(res, "Tour");

  // Find a paid order associated with the tour and user
  const foundOrder = await getCurrentOrder(foundTour, user);
  const foundExpiredToken = await hasOrderExpiredAccess(foundOrder?.id ?? '', foundTour.id);
  if (!foundOrder || foundExpiredToken) return res.status(403).json({
    ok: true,
    message: "Tour not purchased",
    data: {
      purchased: false,
    }
  } as ResponseData);

  // Return success response with tour and order details
  return res.status(200).json({
    ok: true,
    message: "Tour purchased",
    data: {
      purchased: true,
      tour_id: foundTour.id,
      order_id: foundOrder.id,
    },
  } as ResponseData);
};


export const getTourUrl: RequestHandler = async (req: Request, res: Response<ResponseData>) => {
  try {
    const user = req.user as UserWithoutPassword;

    // validate tour
    const foundTour = await prisma.tour.findUnique({
      where: { id: req?.params?.id },
    });
    if (!foundTour) return notFoundResponse(res, "Tour");


    // validate tour purchase
    const foundOrder = await getCurrentOrder(foundTour, user);
    const foundExpiredToken = await hasOrderExpiredAccess(foundOrder?.id ?? '', foundTour.id);
    if (!foundOrder || foundExpiredToken) return res.status(403).json({
      ok: false,
      message: "Tour not purchased",
    });

    // check if access token already exists
    const foundAccess = await prisma.tourAccess.findFirst({
      where: {
        tour_id: foundTour.id,
        user_id: user.id,
        order_id: foundOrder.id,
        expires_at: {
          gt: new Date() // check if expires_at is greater than now
        }
      },
    });
    if (foundAccess) return res.status(200).json({
      ok: true,
      message: "Get tour-url successfully",
      data: {
        tour_url: foundTour.url
      },
    });

    // generate tour access
    await prisma.tourAccess.create({
      data: {
        tour_id: foundTour?.id,
        user_id: user?.id,
        order_id: foundOrder?.id,
        expires_at: new Date(Date.now() + 5 * 1000),
      },
    });
    return res.status(201).json({
      ok: true,
      message: "Get tour-url successfully",
      data: {
        tour_url: foundTour.url
      },
    });
  } catch (error) {
    console.error(error);
    return operationErrorResponse(res);
  }
}

