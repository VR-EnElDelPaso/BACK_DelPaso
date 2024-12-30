import { z } from 'zod';

export const CreateTourSchema = z.object({
  name: z.string(),
  description: z.string(),
  price: z.number().positive(),
  url: z.string().url(),
  image_url: z.string().url(),
  museum_id: z.string().uuid(),
});