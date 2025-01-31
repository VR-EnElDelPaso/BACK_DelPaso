import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Limpia la base de datos antes de insertar nuevos datos
  await prisma.tourTag.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.museum.deleteMany();

  // Crear Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "University" } }),
    prisma.tag.create({ data: { name: "Local" } }),
    prisma.tag.create({ data: { name: "States" } }),
    prisma.tag.create({ data: { name: "Country" } }),
  ]);

  // Crear Museos
  const museums = await Promise.all([
    prisma.museum.create({
      data: {
        name: 'Museo de Historia Natural',
        description: 'Museo con exposiciones de fósiles y animales',
        address_name: 'Calle 1, Ciudad',
        main_photo: 'https://placehold.co/400'
      },
    }),
    prisma.museum.create({
      data: {
        name: 'Museo de Arte Moderno',
        description: 'Museo con exposiciones de pinturas y esculturas',
        address_name: 'Calle 2, Ciudad',
        main_photo: 'https://placehold.co/400'
      },
    }),
  ]);

  // URL de ejemplo para los Tours
  const tourUrl = "https://kuula.co/share/collection/example";

  // Crear Tours con múltiples Tags
  const tours = await Promise.all([
    prisma.tour.create({
      data: {
        name: 'Tour Universitario',
        description: 'Recorrido por las principales universidades de la ciudad',
        price: 25.99,
        stars: 4.5,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[0].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[0].id } } }, // University
            { tag: { connect: { id: tags[1].id } } }  // Local
          ]
        }
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Ruta Gastronómica',
        description: 'Degustación de comida típica en restaurantes locales',
        price: 39.99,
        stars: 4.8,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[1].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[1].id } } }, // Local
            { tag: { connect: { id: tags[2].id } } }  // States
          ]
        }
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Excursión a las montañas',
        description: 'Un día de senderismo en los paisajes naturales más bellos',
        price: 45.50,
        stars: 5.0,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[0].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[2].id } } }, // States
            { tag: { connect: { id: tags[3].id } } }  // Country
          ]
        }
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Tour Nocturno',
        description: 'Explora la ciudad de noche y conoce sus historias más oscuras',
        price: 30.00,
        stars: 4.4,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[1].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[1].id } } }, // Local
            { tag: { connect: { id: tags[3].id } } }  // Country
          ]
        }
      },
    }),
  ]);

  console.log('Seeding executed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
