import { NextFunction, Request, Response } from "express";
import passportInstance from "../passport";
import UserWithoutPassword from "../types/auth/UserWithoutPassword";
import { Role } from "@prisma/client"; // Import correcto del enum Role
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  tourId: string;
}

/**
 * authMiddleware - Middleware to handle authentication for incoming requests.
 * If the user is already authenticated, it proceeds to the next middleware.
 * Otherwise, it attempts to authenticate the user using JWT (JSON Web Token).
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function to proceed to the next middleware.
 * @returns {void} - If the user is authenticated, it calls `next()`. Otherwise, it responds with a 401 Unauthorized error.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if the user is already authenticated
  if (req.isAuthenticated()) {
    return next();
  }

  // Authenticate using JWT if the user is not already authenticated
  passportInstance.authenticate(
    "jwt",
    { session: false },
    (err: Error, user: UserWithoutPassword) => {
      // Handle authentication errors or missing user
      if (err || !user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      // Attach the authenticated user to the request object
      req.user = user;
      next();
    }
  )(req, res, next);
};

/**
 * setUserMiddleware - Middleware to authenticate a user using JWT (JSON Web Token) and attach the authenticated user to the request object.
 * If the JWT is valid and a user is found, the user is attached to `req.user`. If the JWT is invalid or no user is found, the middleware
 * simply calls `next()` without attaching a user, allowing the request to proceed without authentication.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function to proceed to the next middleware or route.
 * @returns {void} - Calls `next()` regardless of whether a user is authenticated or not.
 *
 * @example
 * // Use the middleware to optionally attach a user to the request
 * app.get('/some-route', setUserMiddleware, (req, res) => {
 *   if (req.user) {
 *     res.json({ message: 'Authenticated user', user: req.user });
 *   } else {
 *     res.json({ message: 'No authenticated user' });
 *   }
 * });
 */
export const setUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Authenticate using JWT
  passportInstance.authenticate(
    "jwt",
    { session: false },
    (err: Error, user: UserWithoutPassword) => {
      // If there's an error or no user is found, proceed without attaching a user
      if (err || !user) {
        return next();
      }

      // Attach the authenticated user to the request object
      req.user = user;
      next();
    }
  )(req, res, next);
};

/**
 * verifyRolesMiddleware - Middleware factory to verify if the authenticated user has the required roles.
 * It checks if the user's role is included in the list of allowed roles. If not, it responds with a 403 Forbidden error.
 *
 * @param {Role[]} roles - An array of roles that are allowed to access the route.
 * @returns {(req: Request, res: Response, next: NextFunction) => void} - A middleware function that verifies the user's role.
 *
 * @example
 * // Allow only users with the 'ADMIN' or 'WORKER' roles
 * app.get('/admin-route', verifyRolesMiddleware([Role.ADMIN, Role.WORKER]), (req, res) => {
 *   res.json({ message: 'You have access to this route' });
 * });
 */
export const verifyRolesMiddleware = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Extract the user from the request object
    const user = req.user as UserWithoutPassword;

    // Check if the user's role is included in the allowed roles
    if (!roles.includes(user.role as Role)) {
      // Cast explícito a Role
      return res
        .status(403)
        .json({ ok: false, error: "You do not have sufficient permissions" });
    }

    // If the user has the required role, proceed to the next middleware
    next();
  };
};

/**
 * verifyTokenMiddleware - Middleware to verify the validity of a JWT token provided in the request headers.
 * If the token is valid, it decodes the token and attaches the user ID and tour ID (if present) to the request object.
 * If the token is missing, invalid, or expired, it responds with a 401 Unauthorized error.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The Express next function to proceed to the next middleware.
 * @returns {void} - If the token is valid, it calls `next()`. Otherwise, it responds with a 401 Unauthorized error.
 *
 * @example
 * // Protect a route with token verification
 * app.get('/protected-route', verifyTokenMiddleware, (req, res) => {
 *   res.json({ message: 'You have access to this route', user: req.user });
 * });
 */
export const verifyTokenMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Extract the token from the Authorization header
  const token = req.headers.authorization?.split(" ")[1];
  const secretKey = process.env.JWT_SECRET as string;

  // Check if the token is missing
  if (!token) {
    return res.status(401).json({ ok: false, error: "Token missing" });
  }

  try {
    // Verify and decode the token
    const decoded = jwt.verify(token, secretKey) as DecodedToken;

    // Attach the user ID and tour ID (if present) to the request object
    req.user = { id: decoded.userId } as any;
    (req as any).tourId = decoded.tourId;

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Handle invalid or expired tokens
    console.error("Invalid token:", error);
    return res.status(401).json({ ok: false, error: "Invalid token" });
  }
};
