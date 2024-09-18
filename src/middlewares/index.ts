import { NextFunction, Request, Response } from "express";
import passportInstance from "../passport";
import { user } from "@prisma/client";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";


export const AuthMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    return next();
  }

  passportInstance.authenticate('jwt', { session: false }, (err: Error, user: UserWithoutPassword) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
}