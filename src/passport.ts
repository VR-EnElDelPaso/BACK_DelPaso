import passport from "passport";
import { Strategy, VerifyWithoutRequest } from "@node-saml/passport-saml";
import config from "./config";

// strategy callbacks
const signOnVerifyCallback: VerifyWithoutRequest = (profile, done) => done(null, profile as Record<string, unknown>);
const logOutVerifyCallback: VerifyWithoutRequest = (profile, done) => done(null, profile as Record<string, unknown>);

// passport strategy
export const samlStrategy = new Strategy(
  config.passport.saml,
  signOnVerifyCallback,
  logOutVerifyCallback
)

// passport configuration
const passportInstance = passport
passportInstance.serializeUser((user, done) => done(null, user));
passportInstance.deserializeUser((user: any, done) => done(null, user));

passportInstance.use(samlStrategy);

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

