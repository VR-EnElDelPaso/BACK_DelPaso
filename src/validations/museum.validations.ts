import { Day } from "@prisma/client";
import { z } from "zod";

// Días válidos en español
// const validDays = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export const HourSchema = z.object({
  day: z.enum(Object.values(Day) as [string, ...string[]]),
  isOpen: z.boolean(),
  openTime: z.string().optional().nullable(),
  closeTime: z.string().optional().nullable(),
})
  .refine(data => {
    if (data.isOpen) {
      return data.openTime !== null && data.openTime !== undefined &&
        data.closeTime !== null && data.closeTime !== undefined;
    }
    return data.openTime === null && data.closeTime === null;
  }, {
    message: "If isOpen is true, openTime and closeTime must be provided. If isOpen is false, openTime and closeTime must be null or undefined."
  });

export const HoursSchema = z.array(HourSchema)
  .refine(hours => {
    const daysSet = new Set(hours.map(hour => hour.day));
    const enumDays = Object.values(Day);
    return daysSet.size === enumDays.length && enumDays.every(day => daysSet.has(day));
  }, {
    message: "Must include all and only once all days of the week."
  });

export const CreateMuseumSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  address_name: z.string().min(10),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  main_photo: z.string().url(),
  main_tour_id: z.string().uuid().optional().nullable()
});


// Validación para edición parcial de museos
export const EditMuseumSchema = CreateMuseumSchema.partial();
