import passport from "passport";
import { Strategy as SamlStrategy, VerifyWithoutRequest } from "@node-saml/passport-saml";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import bcrypt from "bcryptjs";
import { PrismaClient, user } from "@prisma/client";
import config from "./config";
import UserWithoutPassword from "./types/auth/UserWithoutPassword";

const prisma = new PrismaClient();

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-default-secret' // Proporciona un valor por defecto
};

// SAML strategy callbacks
const signOnVerifyCallback: VerifyWithoutRequest = (profile, done) =>
  done(null, profile as Record<string, unknown>);
const logOutVerifyCallback: VerifyWithoutRequest = (profile, done) =>
  done(null, profile as Record<string, unknown>);

// SAML strategy
export const samlStrategy = new SamlStrategy(
  config.passport.saml,
  signOnVerifyCallback,
  logOutVerifyCallback
);

// JWT strategy

type TypedVerifyCallback = (
  error: Error | null,
  user?: UserWithoutPassword | false,
  info?: { message: string }
) => void;

const jwtStrategy = new JwtStrategy(jwtOptions, async (payload: JwtPayload, done: TypedVerifyCallback) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: payload.id } });
    if (user) {
      const { password, ...userWithoutPassword } = user;
      return done(null, userWithoutPassword);
    }
    return done(null, false);
  } catch (error) {
    return done(error as Error);
  }
});


const generateToken = (user: UserWithoutPassword): string => {
  const secret = process.env.JWT_SECRET;

  // Verificar si JWT_SECRET está definido en producción
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET must be defined in production');
  }

  // Usar un secreto por defecto solo en desarrollo
  const jwtSecret = secret || 'development-secret';

  const payload = user as JwtPayload;

  return jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
};

// Local strategy
const localStrategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email: string, password: string, done: (error: any, user?: any, info?: any) => void) => {
    try {
      // Buscar al usuario por su email
      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true, // Incluimos el campo password
        },
      });

      // Verifica que el usuario y la contraseña no sean nulos o indefinidos
      if (!user || !user.password) {
        return done(null, false, { message: "Password is not set for this user." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return done(null, false, { message: "Incorrect password." });
      }

      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

// passport configuration
const passportInstance = passport;
passportInstance.serializeUser((user, done) => done(null, user));
passportInstance.deserializeUser((user: any, done) => done(null, user));

passportInstance.use(samlStrategy);
passportInstance.use(localStrategy);
passportInstance.use(jwtStrategy);

export { passportInstance, generateToken };

