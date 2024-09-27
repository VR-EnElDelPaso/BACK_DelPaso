import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpia la base de datos
  await prisma.user_tour_purchase.deleteMany();
  await prisma.tour.deleteMany();
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
        account_number: 20194567,
        name: 'Ana García',
        display_name: 'Ana',
        email: 'ana@example.com',
        role: 'STUDENT',
        password: bcrypt.hashSync('password'),
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

  // Crear 5 tours
  const tours = await Promise.all([
    prisma.tour.create({
      data: {
        name: 'Tour por el centro histórico',
        description: 'Recorrido por los principales monumentos del centro de la ciudad',
        price: 25.99,
        url: 'https://example.com/tour-centro',
        image_url: 'https://example.com/images/centro.jpg',
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Ruta gastronómica',
        description: 'Degustación de platos típicos en los mejores restaurantes',
        price: 39.99,
        url: 'https://example.com/tour-gastronomico',
        image_url: 'https://example.com/images/gastronomia.jpg',
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Excursión a las montañas',
        description: 'Día completo de senderismo y paisajes naturales',
        price: 45.50,
        url: 'https://example.com/tour-montanas',
        image_url: 'https://example.com/images/montanas.jpg',
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Tour nocturno',
        description: 'Descubre la ciudad iluminada y sus leyendas',
        price: 30.00,
        url: 'https://example.com/tour-nocturno',
        image_url: 'https://example.com/images/nocturno.jpg',
      },
    }),
    prisma.tour.create({
      data: {
        name: 'Visita a museos',
        description: 'Recorrido por los principales museos de la ciudad',
        price: 35.75,
        url: 'https://example.com/tour-museos',
        image_url: 'https://example.com/images/museos.jpg',
      },
    }),
  ]);

  // Crear algunas compras de tours
  await Promise.all([
    prisma.user_tour_purchase.create({
      data: {
        user_id: users[0].id,
        tour_id: tours[0].id,
      },
    }),
    prisma.user_tour_purchase.create({
      data: {
        user_id: users[0].id,
        tour_id: tours[2].id,
      },
    }),
    prisma.user_tour_purchase.create({
      data: {
        user_id: users[1].id,
        tour_id: tours[1].id,
      },
    }),
    prisma.user_tour_purchase.create({
      data: {
        user_id: users[2].id,
        tour_id: tours[3].id,
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
    console.log('seeding executed');
    await prisma.$disconnect();
  });