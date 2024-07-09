import { PassportStatic } from "passport";
import { Strategy, VerifyWithoutRequest } from "@node-saml/passport-saml";

import { EnvConfig } from "./config/types";

const signOnVerifyCallback: VerifyWithoutRequest = (profile, done) => done(null, profile as Record<string, unknown>);

const logOutVerifyCallback: VerifyWithoutRequest = (profile, done) => done(null, profile as Record<string, unknown>);

export const passportSetUp = (passport: PassportStatic, config: EnvConfig) => {
  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user: any, done) => done(null, user));
  const samlStrategy = new Strategy(
    config.passport.saml,
    signOnVerifyCallback,     
    logOutVerifyCallback
  )
  passport.use(samlStrategy);
  return samlStrategy;
}

interface Profile {
  issuer:          string;
  inResponseTo:    string;
  sessionIndex:    string;
  nameID:          string;
  nameIDFormat:    string;
  spNameQualifier: string;
  uCorreo:         string;
  uNombre:         string;
  uDependencia:    string;
  uCuenta:         string;
  uTipo:           string;
  cn:              string;
  sn:              string;
  displayName:     string;
  TipoCuenta:      string;
  UO:              string;
  ImmutableID:     string;
  attributes:      Attributes;
}

export interface Attributes {
  uCorreo:      string;
  uNombre:      string;
  uDependencia: string;
  uCuenta:      string;
  uTipo:        string;
  cn:           string;
  sn:           string;
  displayName:  string;
  TipoCuenta:   string;
  UO:           string;
  ImmutableID:  string;
}

