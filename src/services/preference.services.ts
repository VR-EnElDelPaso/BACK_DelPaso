import { tour } from "@prisma/client";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { type  PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";

export const createPreference = async (tour: tour, mpClient: MercadoPagoConfig) => {
  const preferenceData: PreferenceCreateData = {
    body: {
      items: [
        {
          id: tour.id,
          title: tour.name,
          unit_price: Number(tour.price),
          quantity: 1,
        }
      ],
      back_urls: {
        success: 'www.google.com',
        failure: 'www.google.com',
        pending: 'www.google.com',
      }
    }
  }

  const emptyPreference = new Preference(mpClient);
  return await emptyPreference.create(preferenceData);
}