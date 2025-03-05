/**
 * Define los campos que se seleccionarán al realizar una consulta de tours.
 * Este objeto se utiliza para evitar incluir campos sensibles o innecesarios en la respuesta.
 * 
 * - **Exclusión de `tour_url`**: El campo `tour_url` se omite intencionalmente para mantenerlo privado
 *   y no exponerlo en las respuestas de la API.
 * - **Relación con `tags`**: Se incluye la relación con `tags`, seleccionando solo los campos `id` y `name`
 *   del `tag` asociado para evitar cargar datos innecesarios.
 * 
 * @example
 * const tours = await prisma.tour.findMany({
 *   select: TourSelectQuery,
 * });
 */
export const TourSelectQuery = {
  id: true,          // ID único del tour
  name: true,        // Nombre del tour
  description: true, // Descripción del tour
  price: true,       // Precio del tour
  stars: true,       // Calificación en estrellas del tour
  image_url: true,   // URL de la imagen del tour
  museum_id: true,   // ID del museo asociado al tour
  created_at: true,  // Fecha de creación del tour
  updated_at: true,  // Fecha de última actualización del tour
  tags: {
    select: {
      tag: {
        select: {
          id: true,   // ID del tag asociado
          name: true, // Nombre del tag asociado
        },
      },
    },
  },
};