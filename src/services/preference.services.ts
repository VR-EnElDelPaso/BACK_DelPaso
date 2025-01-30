import { Tour } from "@prisma/client";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { type PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";


const back_urls = {
  success: process.env.MP_PREFERENCE_SUCCESS_URL!,
  failure: process.env.MP_PREFERENCE_FAILURE_URL!,
  pending: process.env.MP_PREFERENCE_PENDING_URL!,
}


interface PreferenceItem {
  id: string;
  title: string;
  unit_price: number;
  quantity: number;
}

export const createPreference = async (tour: Tour, mpClient: MercadoPagoConfig) => {
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
      back_urls
    }
  }

  const emptyPreference = new Preference(mpClient);
  return await emptyPreference.create(preferenceData);
}

export const createPreferences = async (
  items: PreferenceCreateData["body"]["items"],
  orderId: string,
  mpClient: MercadoPagoConfig
) => {
  const preferencesData: PreferenceCreateData = {
    body: {
      items,
      external_reference: orderId,
      back_urls
    }
  };
  const emptyPreference = new Preference(mpClient);
  return await emptyPreference.create(preferencesData);
}