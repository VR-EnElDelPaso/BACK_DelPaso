import { z } from "zod";

// Esquema para validar un Slide en la solicitud
export const SlideRequestSchema = z.object({
  index: z.number().int().nonnegative(),
  image_url: z.string().url(),
  title: z.string().optional(),
  description: z.string().optional(),
});

// Esquema para validar la solicitud completa del Carousel
export const CarouselRequestSchema = z.object({
  page_id: z.string().uuid(),
  name: z.string().min(1),
  description: z.string(),
  slides: z.array(SlideRequestSchema),
});

// Tipos TypeScript derivados de los esquemas Zod
export type SlideRequest = z.infer<typeof SlideRequestSchema>;
export type CarouselRequest = z.infer<typeof CarouselRequestSchema>;
