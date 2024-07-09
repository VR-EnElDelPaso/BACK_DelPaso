import dotenv from 'dotenv';
import { EnvConfig } from "../types";

dotenv.config();

export  const development: EnvConfig = {
  app: {
    env: 'development',
    port: Number(process.env.PORT || 4006),
  },
  passport: {
    strategy: 'saml',
    saml: {
      callbackUrl: "http://localhost:4006/login/callback",
      entryPoint: "https://wayf.ucol.mx/saml2/idp/SSOService.php",
      logoutUrl: "https://wayf.ucol.mx/saml2/idp/SingleLogoutService.php",
      logoutCallbackUrl: "http://localhost:4006/api/auth/logout/callback",
      issuer: "http://localhost/20166932",
      decryptionPvk: process.env.SAML_DECRYPTION_PVK!,
      privateKey: process.env.SAML_PRIVATE_KEY!,
      idpCert: process.env.SAML_IDP_CERT!,
      publicCert: process.env.SAML_PUBLIC_CERT!,
    },
  }
}