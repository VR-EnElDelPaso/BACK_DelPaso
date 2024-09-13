import passport from "passport";
import { Strategy as SamlStrategy, VerifyWithoutRequest } from "@node-saml/passport-saml";
import { Strategy as JwtStrategy, ExtractJwt} from 'passport-jwt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { PrismaClient, user } from "@prisma/client";
import config from "./config";
import UserWithoutPassword from "./types/auth/UserWithoutPassword";
import TypedVerifyCallback from "./types/auth/JwtVerifyCallback";

const prisma = new PrismaClient();


// --- SAML ---

// SAML strategy callbacks
const signOnVerifyCallback: VerifyWithoutRequest = (profile, done) =>
  done(null, profile as Record<string, unknown>);
const logOutVerifyCallback: VerifyWithoutRequest = (profile, done) =>
  done(null, profile as Record<string, unknown>);

// SAML strategy
const samlStrategy = new SamlStrategy(
  config.passport.saml,
  signOnVerifyCallback,
  logOutVerifyCallback
);


// --- JWT ---

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET || 'your-default-secret'
};

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

  // verificar que el secreto esté definido en producción
  if (process.env.NODE_ENV === 'production' && !secret) {
    throw new Error('JWT_SECRET must be defined in production');
  }

  // Usar un secreto por defecto solo en desarrollo
  const jwtSecret = secret || 'development-secret';
  const payload = user as JwtPayload;
  return jwt.sign(payload, jwtSecret, { expiresIn: '1d' });
};

// passport configuration
const passportInstance = passport;
passportInstance.serializeUser((user, done) => done(null, user));
passportInstance.deserializeUser((user: any, done) => done(null, user));

passportInstance.use(samlStrategy);
passportInstance.use(jwtStrategy);

export default passportInstance;
export { generateToken, samlStrategy };

