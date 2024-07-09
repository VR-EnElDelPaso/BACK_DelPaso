import { development } from "./environments";
import { Environment } from "./types";


const env = process.env.NODE_ENV as Environment || 'development';

const config = {
  development,
  //todo: add production and test configurations
  production: development,
  test: development,
} [env];

export default config;
