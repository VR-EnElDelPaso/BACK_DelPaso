import { z } from "zod";


export const CreateMuseumSchema = z.object({
  name: z.string(),
  description: z.string(),
  address_name: z.string(),
  main_photo: z.string(),
  main_tour_id: z.string().optional(),
});

export const EditMuseumSchema = CreateMuseumSchema.partial();