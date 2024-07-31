import { type  PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";
import { tour } from "@prisma/client";
import mpClient from "../mercadopago";
import { Preference } from "mercadopago";

export const CreatePreference = async (tour: tour) => {
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