import { z } from 'zod';

export const CreateTourSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  price: z.number().positive(),
  url: z.string().url(),
  image_url: z.string().url(),
  museum_id: z.string().uuid(),
});

// permit partial updates to patch a record
export const EditTourSchema = CreateTourSchema.partial();