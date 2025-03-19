import { z } from "zod";
import { Request, Response } from "express";
import { ResponseData } from "../../types/ResponseData";
import UserWithoutPassword from "../../types/auth/UserWithoutPassword";

export const validateIdAndRespond = (res: Response, id: string) => {
  const idValidation = z.string().uuid().safeParse(id);
  if (!idValidation.success) {
    res.status(400).json({
      ok: false,
      message: "Invalid id",
      errors: idValidation.error.format()["_errors"],
    } as unknown as ResponseData);
    return null;
  }
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

export const operationErrorResponse = (res: Response) => {
  return res.status(500).json({
    ok: false,
    message: "Operation error",
  } as ResponseData);
}

export const isAdminUser = (req: Request) => {
  console.log(req?.user);
  return (req?.user as UserWithoutPassword)?.role === "ADMIN";
}

export const handleControllerError = (error: unknown, res: Response) => {
  console.error('Controller error:', error);
  
  if (error instanceof z.ZodError) {
    return invalidBodyResponse(res, error);
  }
  
  // Si el error tiene un mensaje específico
  if (error instanceof Error) {
    return res.status(500).json({
      ok: false,
      message: `Operation error: ${error.message}`
    });
  }
  
  return operationErrorResponse(res);
};