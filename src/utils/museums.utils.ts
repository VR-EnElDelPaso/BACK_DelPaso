import prisma from "../prisma";
import { Day, Museum, OpenHour } from "@prisma/client";

/**
 * Mapeo de días en español a su equivalente en el enum Day de Prisma.
 */
const dayMap: Record<string, Day> = {
  "Domingo": Day.SUNDAY,
  "Lunes": Day.MONDAY,
  "Martes": Day.TUESDAY,
  "Miércoles": Day.WEDNESDAY,
  "Jueves": Day.THURSDAY,
  "Viernes": Day.FRIDAY,
  "Sábado": Day.SATURDAY
};

/**
 * Mapeo inverso de enum Day a español.
 */
export const dayReverseMap: Record<Day, string> = {
  SUNDAY: "Domingo",
  MONDAY: "Lunes",
  TUESDAY: "Martes",
  WEDNESDAY: "Miércoles",
  THURSDAY: "Jueves",
  FRIDAY: "Viernes",
  SATURDAY: "Sábado"
};

/**
 * Crea registros de OpenHour asociados a un museo.
 * @param museumId - ID del museo
 * @param hours - Array de objetos con los horarios
 */
export const createOpenHoursForMuseum = async (museumId: string, hours: { day: string; isOpen: boolean }[]) => {
  const openHoursData = hours.map((hour) => {
    const dayEnum = dayMap[hour.day];

    if (!dayEnum) {
      throw new Error(`Invalid day value: ${hour.day}`);
    }

    return {
      museum_id: museumId,
      day: dayEnum,
      is_open: hour.isOpen,
      open_time: hour.isOpen ? "09:00" : "00:00",
      close_time: hour.isOpen ? "17:00" : "00:00",
    };
  });

  await prisma.openHour.createMany({ data: openHoursData });
};


export const museumSerializer = async (museumRecord: Museum, includeOpenHours: boolean = true) => {
  const base = {
    id: museumRecord.id,
    name: museumRecord.name,
    description: museumRecord.description,
    address_name: museumRecord.address_name,
    latitude: museumRecord.latitude,
    longitude: museumRecord.longitude,
    main_photo: museumRecord.main_photo,
    main_tour_id: museumRecord.main_tour_id,
    created_at: museumRecord.created_at,
    updated_at: museumRecord.updated_at,
  };

  if (includeOpenHours) {
    const museumOpenHours = await prisma.openHour.findMany({
      where: { museum_id: museumRecord.id },
      orderBy: { day: "asc" }
    })

    const serializedOpenHours = museumOpenHours.map(openHour => {
      return {
        day: openHour.day,
        isOpen: openHour.is_open,
        openTime: openHour.open_time,
        closeTime: openHour.close_time
      }
    })
    return {
      ...base,
      "hours": serializedOpenHours
    };
  }

  return base;
}