import { Tour } from "@prisma/client";
import MercadoPagoConfig, { Preference } from "mercadopago";
import { type PreferenceCreateData } from "mercadopago/dist/clients/preference/create/types";

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

export const createPreferences = async (
  items: PreferenceCreateData["body"]["items"],
  userId: string,
  mpClient: MercadoPagoConfig
) => {
  const preferencesData: PreferenceCreateData = {
    body: {
      items,
      external_reference: userId,
      back_urls: {
        success: 'www.google.com',
        failure: 'www.google.com',
        pending: 'www.google.com',
      }
    }
  };
  const emptyPreference = new Preference(mpClient);
  return await emptyPreference.create(preferencesData);
}