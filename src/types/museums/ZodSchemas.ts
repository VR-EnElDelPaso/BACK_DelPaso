import { z } from "zod";

export const CreateMuseumSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  address_name: z.string().min(10),
  main_photo: z.string().url(),
  main_tour_id: z.string().uuid().optional(),
});

// permit partial updates to patch a record
export const EditMuseumSchema = CreateMuseumSchema.partial();