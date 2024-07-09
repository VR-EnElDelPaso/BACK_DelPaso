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
  env: Environment;
}

export interface EnvConfig {
  app: AppConfig;
  passport: PassportConfig;
}

export type Environment = "development" | "production" | "test";