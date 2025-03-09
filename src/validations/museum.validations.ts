import { z } from "zod";

// Días válidos en español
const validDays = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export const CreateMuseumSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  address_name: z.string().min(10),
  main_photo: z.string().url(),
  main_tour_id: z.string().uuid().optional().nullable(),
  hours: z.array(
    z.object({
      day: z.enum(validDays as [string, ...string[]]),
      isOpen: z.boolean(),
    })
  ).optional().default([]),
});

// Validación para edición parcial de museos
export const EditMuseumSchema = CreateMuseumSchema.partial();
