import { NextFunction, Request, Response } from "express";

export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.json({
    ok: false,
    message: "Not authenticated",
  });
}