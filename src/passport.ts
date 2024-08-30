import passport from "passport";
import { Strategy as SamlStrategy, VerifyWithoutRequest } from "@node-saml/passport-saml";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import config from "./config";

const prisma = new PrismaClient();

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

export default passportInstance;

interface Profile {
  issuer: string;
  inResponseTo: string;
  sessionIndex: string;
  nameID: string;
  nameIDFormat: string;
  spNameQualifier: string;
  uCorreo: string;
  uNombre: string;
  uDependencia: string;
  uCuenta: string;
  uTipo: string;
  cn: string;
  sn: string;
  displayName: string;
  TipoCuenta: string;
  UO: string;
  ImmutableID: string;
  attributes: Attributes;
}

export interface Attributes {
  uCorreo: string;
  uNombre: string;
  uDependencia: string;
  uCuenta: string;
  uTipo: string;
  cn: string;
  sn: string;
  displayName: string;
  TipoCuenta: string;
  UO: string;
  ImmutableID: string;
}

