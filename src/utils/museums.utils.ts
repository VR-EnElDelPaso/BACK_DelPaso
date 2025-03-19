import prisma from "../prisma";
import { Day } from "@prisma/client";

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
