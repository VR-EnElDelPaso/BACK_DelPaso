import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpia la base de datos antes de insertar nuevos datos
  await prisma.tourTag.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.museum.deleteMany();
  await prisma.user.deleteMany(); // Añadido para limpiar usuarios existentes

  // Crear 4 usuarios (2 estudiantes y 2 visitantes)
  const users = await Promise.all([
    prisma.user.create({
      data: {
        account_number: 20183890,
        name: 'Miguel Angel',
        display_name: 'Miguel',
        email: 'miguel@example.com',
        role: 'STUDENT',
        password: bcrypt.hashSync('password'),
      },
    }),
    prisma.user.create({
      data: {
        name: 'Admin',
        display_name: 'Admin',
        email: 'admin@admin.com',
        role: 'ADMIN',
        password: bcrypt.hashSync('tamaldepollo'),
      },
    }),
    prisma.user.create({
      data: {
        account_number: 30001234,
        name: 'Carlos Rodríguez',
        display_name: 'Carlos',
        email: 'carlos@example.com',
        role: 'WORKER',
        password: bcrypt.hashSync('password'), // Añadido password por seguridad
      },
    }),
    prisma.user.create({
      data: {
        account_number: 30005678,
        name: 'Laura Martínez',
        display_name: 'Laura',
        email: 'laura@example.com',
        role: 'VISITOR',
        password: bcrypt.hashSync('password'), // Añadido password por seguridad
      },
    }),
  ]);

  // Crear Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "universitario" } }),
    prisma.tag.create({ data: { name: "local" } }),
    prisma.tag.create({ data: { name: "otros estados" } }),
    prisma.tag.create({ data: { name: "otros países" } }),
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
        main_photo: 'https://placehold.co/400',
        open_hours: {
          create: [
            {
              day: 'MONDAY',
              is_open: true,
              open_time: '09:00',
              close_time: '18:00',
            },
            {
              day: 'TUESDAY',
              is_open: true,
              open_time: '09:00',
              close_time: '18:00',
            },
            {
              day: 'WEDNESDAY',
              is_open: true,
              open_time: '09:00',
              close_time: '18:00',
            },
            {
              day: 'THURSDAY',
              is_open: true,
              open_time: '09:00',
              close_time: '18:00',
            },
            {
              day: 'FRIDAY',
              is_open: true,
              open_time: '09:00',
              close_time: '18:00',
            },
            {
              day: 'SATURDAY',
              is_open: false,
              open_time: '',
              close_time: '',
            },
            {
              day: 'SUNDAY',
              is_open: false,
              open_time: '',
              close_time: '',
            }
          ]
        }
      }
      ,
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
            { tag: { connect: { id: tags[0].id } } }, // Universitario
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
            { tag: { connect: { id: tags[2].id } } }  // otros estados
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
            { tag: { connect: { id: tags[3].id } } }  // otros países
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
