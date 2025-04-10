import { RequestHandler, Request, Response } from "express";
import { ResponseData } from "../types/ResponseData";
import prisma from "../prisma";
import { z } from "zod";

// Schema for creating a new FAQ
const CreateFaqSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().min(1, "La descripción es requerida"),
});

// Schema for updating an FAQ (all fields optional for PATCH)
const UpdateFaqSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  description: z.string().min(1, "La descripción es requerida").optional(),
});

/**
 * Get all FAQs
 */
export const getAllFaqsController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const faqs = await prisma.faq.findMany();

    return res.status(200).json({
      ok: true,
      message: "FAQs fetched successfully",
      data: faqs,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error fetching FAQs",
      errors: (error as any).message,
    } as ResponseData);
  }
};

/**
 * Get FAQ by ID
 */
export const getFaqByIdController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const faq = await prisma.faq.findUnique({
      where: { id },
    });

    if (!faq) {
      return res.status(404).json({
        ok: false,
        message: "FAQ not found",
      } as ResponseData);
    }

    return res.status(200).json({
      ok: true,
      message: "FAQ fetched successfully",
      data: faq,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error fetching FAQ",
      errors: (error as any).message,
    } as ResponseData);
  }
};

/**
 * Create a new FAQ
 */
export const createFaqController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const bodyValidation = CreateFaqSchema.safeParse(req.body);
    if (!bodyValidation.success) {
      return res.status(400).json({
        ok: false,
        message: "Invalid request body",
        errors: Object.values(bodyValidation.error.format())
          .map((err) => (Array.isArray(err) ? err : err._errors))
          .flat(),
      } as ResponseData);
    }

    const faq = await prisma.faq.create({
      data: bodyValidation.data,
    });

    return res.status(201).json({
      ok: true,
      message: "FAQ created successfully",
      data: faq,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error creating FAQ",
      errors: (error as any).message,
    } as ResponseData);
  }
};

/**
 * Update an FAQ (partial update)
 */
export const updateFaqController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const bodyValidation = UpdateFaqSchema.safeParse(req.body);

    if (!bodyValidation.success) {
      return res.status(400).json({
        ok: false,
        message: "Invalid request body",
        errors: Object.values(bodyValidation.error.format())
          .map((err) => (Array.isArray(err) ? err : err._errors))
          .flat(),
      } as ResponseData);
    }

    // Check if FAQ exists
    const existingFaq = await prisma.faq.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return res.status(404).json({
        ok: false,
        message: "FAQ not found",
      } as ResponseData);
    }

    // Update the FAQ
    const updatedFaq = await prisma.faq.update({
      where: { id },
      data: bodyValidation.data,
    });

    return res.status(200).json({
      ok: true,
      message: "FAQ updated successfully",
      data: updatedFaq,
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error updating FAQ",
      errors: (error as any).message,
    } as ResponseData);
  }
};

/**
 * Delete an FAQ
 */
export const deleteFaqController: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // Check if FAQ exists
    const existingFaq = await prisma.faq.findUnique({
      where: { id },
    });

    if (!existingFaq) {
      return res.status(404).json({
        ok: false,
        message: "FAQ not found",
      } as ResponseData);
    }

    // Delete the FAQ
    await prisma.faq.delete({
      where: { id },
    });

    return res.status(200).json({
      ok: true,
      message: "FAQ deleted successfully",
    } as ResponseData);
  } catch (error) {
    return res.status(500).json({
      ok: false,
      message: "Error deleting FAQ",
      errors: (error as any).message,
    } as ResponseData);
  }
};