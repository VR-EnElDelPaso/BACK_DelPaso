import dotenv from 'dotenv';
import { EnvConfig } from "../types";

dotenv.config();

const port = Number(process.env.PORT || 4006);

export  const production: EnvConfig = {
  app: {
    env: 'production',
    port: port,
    clientUrl: 'https://el-del-paso.netlify.app/',
  },
  passport: {
    strategy: 'saml',
    saml: {
      callbackUrl: `http://localhost:${port}/login/callback`,
      entryPoint: "https://wayf.ucol.mx/saml2/idp/SSOService.php",
      logoutUrl: "https://wayf.ucol.mx/saml2/idp/SingleLogoutService.php",
      logoutCallbackUrl: `"http://localhost:${port}/api/auth/logout/callback`,
      issuer: "http://localhost/20166932",
      decryptionPvk: process.env.SAML_DECRYPTION_PVK!,
      privateKey: process.env.SAML_PRIVATE_KEY!,
      idpCert: process.env.SAML_IDP_CERT!,
      publicCert: process.env.SAML_PUBLIC_CERT!,
    },
  }
}