import { z } from "zod";

export const CreateTourSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  url: z.string().url(),
  image_url: z.string().url(),
  museum_id: z.string().uuid(),
  tags: z.array(z.string()).optional(),
  is_accreditable: z.boolean().default(false),
  accreditable_hours: z.number().positive().optional().nullable(),
});

// Permit partial updates to patch a record
export const EditTourSchema = CreateTourSchema.partial();

export const IdsSchema = z.array(z.string());
