import { MercadoPagoConfig } from 'mercadopago';
import config from './config';

const mpClient = new MercadoPagoConfig({
  accessToken: config.mercadopago.access_token
});

export default mpClient;
