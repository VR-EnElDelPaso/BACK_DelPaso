import fs from 'fs';
import { EnvConfig } from "./types";
import dotenv from 'dotenv';

dotenv.config({
  // just in case the .env file is not in the root directory
  path: '.env'
});

const config: EnvConfig = {
  app: {
    env: process.env.NODE_ENV!,
    port: Number(process.env.PORT!),
    clientUrl: process.env.CLIENT_URL!,
  },
  passport: {
    strategy: process.env.PASSPORT_STRATEGY!,
    saml: {
      issuer: process.env.SAML_ISSUER!,
      entryPoint: process.env.SAML_ENTRY_POINT!,
      logoutUrl: process.env.SAML_LOGOUT_URL!,

      callbackUrl: `${process.env.HOST_URL}${process.env.SAML_CALLBACK_URL}`,
      logoutCallbackUrl: `${process.env.HOST_URL}${process.env.SAML_LOGOUT_CALLBACK_URL}`,
      
      decryptionPvk: fs.readFileSync('./certs/key.pem', 'utf-8'),
      privateKey: fs.readFileSync('./certs/key.pem', 'utf-8'),
      idpCert: fs.readFileSync('./certs/idp.crt', 'utf-8'),
      publicCert: fs.readFileSync('./certs/cert.pem', 'utf-8'),
    },
  }
}

export default config;
