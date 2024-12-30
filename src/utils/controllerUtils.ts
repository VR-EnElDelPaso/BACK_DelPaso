import { Response } from "express";
import { z } from "zod";
import { ResponseData } from "../types/ResponseData";

export const validateIdAndRespond = (res: Response, id: string) => {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success)
    return res.status(400).json({
      ok: false,
      message: "Invalid id",
      errors: idValidation.error.format()["_errors"],
    } as unknown as ResponseData);
  return idValidation.data;
}

export const notFoundResponse = (res: Response, entity: string) => res.status(404).json({
  ok: false,
  message: `${entity} not found`,
} as ResponseData);

export const invalidBodyResponse = (res: Response, errors: z.ZodError) => res.status(400).json({
  ok: false,
  message: "Invalid body",
  errors: errors.formErrors.fieldErrors,
} as unknown as ResponseData);

export const validateEmptyBody = (body: any): boolean => {
  return Object.keys(body).length === 0;
};

export const emptyBodyResponse = (res: Response) => res.status(400).json({
  ok: false,
  message: "At least one field is required",
} as ResponseData);