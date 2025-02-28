import { z } from "zod";


const OpenHourSchema = z.object({
  day: z.string(),
  is_open: z.boolean(),
  open_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),
  close_time: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)")
});

export const CreateMuseumSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  address_name: z.string().min(10),
  main_photo: z.string().url(),
  main_tour_id: z.string().uuid().optional().nullable(),
  open_hours: z.array(OpenHourSchema).optional().default([])
});

// permit partial updates to patch a record
export const EditMuseumSchema = CreateMuseumSchema.partial();