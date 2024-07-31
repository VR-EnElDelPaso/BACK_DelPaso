export interface SamlConfig {
  callbackUrl: string;
  entryPoint: string;
  logoutUrl: string;
  logoutCallbackUrl: string;
  issuer: string;
  decryptionPvk: string;
  privateKey: string;
  idpCert: string;
  publicCert: string;
}

export interface PassportConfig {
  strategy: string;
  saml: SamlConfig;
}

export interface AppConfig {
  port: number;
  env: string;
  clientUrl: string;
}

export interface MPConfig {
  access_token: string;
}

export interface EnvConfig {
  app: AppConfig;
  mercadopago: MPConfig;
  passport: PassportConfig;
}