import { Request, Response } from "express";
import prisma from "../prisma";
import { z } from "zod";
import { CarouselRequestSchema } from "../types/carousel/ZodSchemas";
import { ResponseData } from "../types/ResponseData";
import { handleControllerError, notFoundResponse } from "../utils/controller.utils";

export const getCarousels = async (req: Request, res: Response) => {
  try {
    // Primero obtenemos todos los carruseles con sus slides
    const carousels = await prisma.carrousel.findMany({
      include: {
        slides: {
          orderBy: {
            index: "asc",
          },
        },
      },
    });

    // Para cada carrusel, procesamos sus slides para incluir título y descripción
    const carouselsWithDetails = await Promise.all(
      carousels.map(async (carousel) => {
        const slidesWithDetails = await Promise.all(
          carousel.slides.map(async (slide) => {
            // Obtener los copies asociados a este slide
            const copies = await prisma.copy.findMany({
              where: { entity_id: slide.id },
            });

            // Buscar el título (HEADER) y la descripción (PARAGRAPH)
            const titleCopy = copies.find((copy) => copy.type === "HEADER");
            const descriptionCopy = copies.find(
              (copy) => copy.type === "PARAGRAPH"
            );

            // Devolver el slide con título y descripción
            return {
              ...slide,
              title: titleCopy?.content || "",
              description: descriptionCopy?.content || "",
            };
          })
        );

        // Devolver el carrusel con los slides procesados
        return {
          ...carousel,
          slides: slidesWithDetails,
        };
      })
    );

    return res.status(200).json({
      ok: true,
      message: "Carousels retrieved successfully",
      data: carouselsWithDetails,
    } as ResponseData);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

export const getCarouselById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const carousel = await prisma.carrousel.findUnique({
      where: { id },
      include: {
        slides: {
          orderBy: {
            index: "asc",
          },
        },
      },
    });

    if (!carousel) {
      return res.status(404).json({
        ok: false,
        message: "Carousel not found",
      } as ResponseData);
    }

    // Buscar los Copies asociados a cada slide para obtener título y descripción
    const slidesWithDetails = await Promise.all(
      carousel.slides.map(async (slide) => {
        const copies = await prisma.copy.findMany({
          where: { entity_id: slide.id },
        });

        const titleCopy = copies.find((copy) => copy.type === "HEADER");
        const descriptionCopy = copies.find(
          (copy) => copy.type === "PARAGRAPH"
        );

        return {
          ...slide,
          title: titleCopy?.content || "",
          description: descriptionCopy?.content || "",
        };
      })
    );

    return res.status(200).json({
      ok: true,
      message: "Carousel retrieved successfully",
      data: {
        ...carousel,
        slides: slidesWithDetails,
      },
    } as ResponseData);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

interface SlideWithTitleDesc {
  index: number;
  image_url: string;
  title?: string;
  description?: string;
}

export const createCarousel = async (req: Request, res: Response) => {
  try {
    // Validar el body de la solicitud
    const validatedData = CarouselRequestSchema.parse(req.body);
    const { page_id, name, description, slides } = validatedData;

    // Verificar que la página existe
    const pageExists = await prisma.page.findUnique({
      where: { id: page_id },
    });

    if (!pageExists) return notFoundResponse(res, "Page");

    // Crear el carrusel con sus slides en una única transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear el carrusel
      const carousel = await tx.carrousel.create({
        data: {
          page_id,
          name,
          description,
        },
      });

      // Crear los slides
      const createdSlides = await Promise.all(
        slides.map(async (slide: SlideWithTitleDesc) => {
          // Crear el slide
          const createdSlide = await tx.slide.create({
            data: {
              carrousel_id: carousel.id,
              index: slide.index,
              image_url: slide.image_url,
            },
          });

          // Crear el Copy para el título si existe
          if (slide.title) {
            await tx.copy.create({
              data: {
                entity_id: createdSlide.id,
                type: "HEADER",
                content: slide.title,
                weight: "1",
              },
            });
          }

          // Crear el Copy para la descripción si existe
          if (slide.description) {
            await tx.copy.create({
              data: {
                entity_id: createdSlide.id,
                type: "PARAGRAPH",
                content: slide.description,
                weight: "2",
              },
            });
          }

          return {
            ...createdSlide,
            title: slide.title || "",
            description: slide.description || "",
          };
        })
      );

      return {
        ...carousel,
        slides: createdSlides,
      };
    });

    return res.status(201).json({
      ok: true,
      message: "Carousel created successfully",
      data: result,
    } as ResponseData);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

export const updateCarousel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validatedData = CarouselRequestSchema.parse(req.body);
    const { name, description, slides, page_id } = validatedData;

    // Verificar que el carrusel existe
    const carouselExists = await prisma.carrousel.findUnique({
      where: { id },
      include: {
        slides: true,
      },
    });

    if (!carouselExists) return notFoundResponse(res, "Carousel");

    // Verificar que la página existe
    const pageExists = await prisma.page.findUnique({
      where: { id: page_id },
    });

    if (!pageExists) return notFoundResponse(res, "Page");

    // Actualizar el carrusel con sus slides en una única transacción
    const result = await prisma.$transaction(async (tx) => {
      // Actualizar el carrusel
      const carousel = await tx.carrousel.update({
        where: { id },
        data: {
          page_id,
          name,
          description,
        },
      });

      // Eliminar slides existentes y sus copies asociados
      for (const slide of carouselExists.slides) {
        // Eliminar copies asociados al slide
        await tx.copy.deleteMany({
          where: { entity_id: slide.id },
        });
      }

      // Eliminar todos los slides actuales
      await tx.slide.deleteMany({
        where: { carrousel_id: id },
      });

      // Crear los nuevos slides
      const createdSlides = await Promise.all(
        slides.map(async (slide: SlideWithTitleDesc) => {
          // Crear el slide
          const createdSlide = await tx.slide.create({
            data: {
              carrousel_id: carousel.id,
              index: slide.index,
              image_url: slide.image_url,
            },
          });

          // Crear el Copy para el título si existe
          if (slide.title) {
            await tx.copy.create({
              data: {
                entity_id: createdSlide.id,
                type: "HEADER",
                content: slide.title,
                weight: "1",
              },
            });
          }

          // Crear el Copy para la descripción si existe
          if (slide.description) {
            await tx.copy.create({
              data: {
                entity_id: createdSlide.id,
                type: "PARAGRAPH",
                content: slide.description,
                weight: "2",
              },
            });
          }

          return {
            ...createdSlide,
            title: slide.title || "",
            description: slide.description || "",
          };
        })
      );

      return {
        ...carousel,
        slides: createdSlides,
      };
    });

    return res.status(200).json({
      ok: true,
      message: "Carousel updated successfully",
      data: result,
    } as ResponseData);
  } catch (error) {
    return handleControllerError(error, res);
  }
};

export const deleteCarousel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Verificar que el carrusel existe
    const carouselExists = await prisma.carrousel.findUnique({
      where: { id },
      include: {
        slides: true,
      },
    });

    if (!carouselExists) return notFoundResponse(res, "Carousel");

    // Eliminar el carrusel y sus slides en una única transacción
    await prisma.$transaction(async (tx) => {
      // Eliminar copies asociados a cada slide
      for (const slide of carouselExists.slides) {
        await tx.copy.deleteMany({
          where: { entity_id: slide.id },
        });
      }

      // Eliminar slides
      await tx.slide.deleteMany({
        where: { carrousel_id: id },
      });

      // Eliminar carrusel
      await tx.carrousel.delete({
        where: { id },
      });
    });

    return res.status(200).json({
      ok: true,
      message: "Carousel deleted successfully",
    } as ResponseData);
  } catch (error) {
    return handleControllerError(error, res);
  }
};
