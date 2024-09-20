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

export const createPreferences = async(cart: { id: string, name: string, price: number, quantity: number }[], mpClient: MercadoPagoConfig) =>{
  const items = cart.map(item=> ({
    id: item.id,
    title: item.name,
    unit_price: Number(item.price),
    quantity: item.quantity,
  }));
  const preferencesData : PreferenceCreateData = {
    body: {
      items, // Array de items con las cantidades reales por producto
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