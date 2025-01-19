import { NextFunction, Request, Response } from "express";
import passportInstance from "../passport";
import { User } from "@prisma/client";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";
import jwt from "jsonwebtoken";


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

interface DecodedToken {
  userId: string;
  tourId: string;
}

export const verifyTokenMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];
  const secretKey = process.env.JWT_SECRET as string;

  if (!token) {
    return res.status(401).json({ ok: false, error: 'No se proporcionó un token' });
  }

  try {
    const decoded = jwt.verify(token, secretKey) as DecodedToken;
    req.user = { id: decoded.userId } as any;
    (req as any).tourId = decoded.tourId;
    next();
  } catch (error) {
    console.error("Token inválido:", error);
    return res.status(401).json({ ok: false, error: 'Token inválido o expirado' });
  }
};