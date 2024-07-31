import { development, production } from "./environments";
import { Environment } from "./types";


const env = process.env.NODE_ENV as Environment || 'development';

const config = {
  development,
  //todo: add test configurations
  production,
  test: development,
} [env];

export default config;
