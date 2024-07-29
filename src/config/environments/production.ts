import dotenv from 'dotenv';
import { EnvConfig } from "../types";
import fs from 'fs';

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
      decryptionPvk: fs.readFileSync('./certs/key.pem', 'utf-8'),
      privateKey: fs.readFileSync('./certs/key.pem', 'utf-8'),
      idpCert: fs.readFileSync('./certs/idp.crt', 'utf-8'),
      publicCert: fs.readFileSync('./certs/cert.pem', 'utf-8'),
    },
  }
}