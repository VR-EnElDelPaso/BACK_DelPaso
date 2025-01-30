import { Day, OrderStatus, PrismaClient, Role, TourTag } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpia la base de datos
  await prisma.order.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.preference.deleteMany();
  await prisma.openHour.deleteMany();
  await prisma.museum.deleteMany();
  await prisma.user.deleteMany();

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
      },
    }),
    prisma.user.create({
      data: {
        account_number: 30005678,
        name: 'Laura Martínez',
        display_name: 'Laura',
        email: 'laura@example.com',
        role: 'VISITOR',
      },
    }),
  ]);

  const museums = await Promise.all([
    prisma.museum.create({
      data: {
        name: 'Museo de Historia Natural',
        description: 'Museo de historia natural con exposiciones de animales y fósiles',
        address_name: 'Calle 1, Ciudad',
        main_photo: 'https://placehold.co/400'
      },
    }),
    prisma.museum.create({
      data: {
        name: 'Museo de Arte Moderno',
        description: 'Museo de arte moderno con exposiciones de pinturas y esculturas',
        address_name: 'Calle 2, Ciudad',
        main_photo: 'https://placehold.co/400',
        main_tour_id: ""
      },
    }),
  ]);

  Object.values(Day).map(async (day) => {
    await prisma.openHour.create({
      data: {
        day,
        open_time: "09:00",
        close_time: "18:00",
        museum_id: museums[0].id,
      },
    });
    await prisma.openHour.create({
      data: {
        day,
        open_time: "10:00",
        close_time: "20:00",
        museum_id: museums[1].id,
      },
    });
  });

  const tourUrl = "https://kuula.co/share/collection/7cp8f?logo=0&info=0&fs=1&vr=1&sd=1&initload=0&thumbs=1";

  // Crear 5 tours con tags asignados
  const tours = await Promise.all([
    prisma.tour.create({
      data: {
        name: 'Tour por el centro histórico',
        description: 'Recorrido por los principales monumentos del centro de la ciudad',
        price: 25.99,
        stars: 4.5,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[0].id,
        tags: [TourTag.Local, TourTag.University] // Tour local
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Ruta gastronómica',
        description: 'Degustación de platos típicos en los mejores restaurantes',
        price: 39.99,
        stars: 4.8,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[1].id,
        tags: [TourTag.Local] // Tour local
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Excursión a las montañas',
        description: 'Día completo de senderismo y paisajes naturales',
        price: 45.50,
        stars: 5.0,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[0].id,
        tags: [TourTag.States] // Tour a otro estado
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Tour nocturno',
        description: 'Descubre la ciudad iluminada y sus leyendas',
        price: 30.00,
        stars: 4.4,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[1].id,
        tags: [TourTag.University] // Tour universitario
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Visita a museos',
        description: 'Recorrido por los principales museos de la ciudad',
        price: 35.75,
        stars: 4.9,
        url: tourUrl,
        image_url: 'https://placehold.co/400',
        museum_id: museums[0].id,
        tags: [TourTag.Country] // Tour a otro país
      },
    }),
  ]);

  const orders = await Promise.all([
    prisma.order.create({
      data: {
        user_id: users[0].id,
        tours: {
          connect: [
            { id: tours[0].id },
            { id: tours[1].id },
          ],
        },
        status: OrderStatus.PENDING,
        total: tours[0].price,
      },
    }),
    prisma.order.create({
      data: {
        user_id: users[0].id,
        tours: {
          connect: [
            { id: tours[0].id },
            { id: tours[3].id },
          ],
        },
        status: OrderStatus.PENDING,
        total: tours[0].price,
      },
    }),
    prisma.order.create({
      data: {
        user_id: users[1].id,
        tours: {
          connect: [
            { id: tours[2].id },
            { id: tours[3].id },
          ],
        },
        status: OrderStatus.PENDING,
        total: tours[1].price,
      },
    }),
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    console.log('Seeding executed');
    await prisma.$disconnect();
  });