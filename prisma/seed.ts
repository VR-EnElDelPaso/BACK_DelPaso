import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Limpia la base de datos antes de insertar nuevos datos
  await prisma.copy.deleteMany();
  await prisma.slide.deleteMany();
  await prisma.carrousel.deleteMany();
  await prisma.page.deleteMany();
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

  // Crear la landing page principal
  const landingPage = await prisma.page.create({
    data: {
      name: 'Landing Page Principal',
      description: 'Página de inicio del sitio web del museo'
    }
  });

  // Crear algunos textos (copies) para la página de landing
  await Promise.all([
    prisma.copy.create({
      data: {
        entity_id: landingPage.id,
        type: 'HEADER',
        content: 'Bienvenidos al Museo',
        weight: '1'
      }
    }),
    prisma.copy.create({
      data: {
        entity_id: landingPage.id,
        type: 'PARAGRAPH',
        content: 'Descubre nuestras exhibiciones únicas y tours virtuales',
        weight: '2'
      }
    }),
    prisma.copy.create({
      data: {
        entity_id: landingPage.id,
        type: 'BUTTON',
        content: 'Explorar Tours',
        weight: '3'
      }
    })
  ]);

  // Crear carrusel principal
  const mainCarousel = await prisma.carrousel.create({
    data: {
      page_id: landingPage.id,
      name: 'Novedades',
      description: 'Carrusel de novedades del museo'
    }
  });

  // Crear slides para el carrusel
  const slides = await Promise.all([
    prisma.slide.create({
      data: {
        carrousel_id: mainCarousel.id,
        index: 0,
        image_url: 'https://placehold.co/800x400/orange/white?text=Exhibición+Especial'
      }
    }),
    prisma.slide.create({
      data: {
        carrousel_id: mainCarousel.id,
        index: 1,
        image_url: 'https://placehold.co/800x400/blue/white?text=Tours+Virtuales'
      }
    }),
    prisma.slide.create({
      data: {
        carrousel_id: mainCarousel.id,
        index: 2,
        image_url: 'https://placehold.co/800x400/green/white?text=Eventos+Especiales'
      }
    })
  ]);

  console.log('Seeding base data completed');
  
  // Después de crear los slides, ahora creamos los títulos y descripciones como copies
  const slideCopies = [];
  
  // Títulos y descripciones para el primer slide
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[0].id,
        type: 'HEADER',
        content: 'Nueva Exhibición: Dinosaurios',
        weight: '1'
      }
    })
  );
  
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[0].id,
        type: 'PARAGRAPH',
        content: 'Descubre los fósiles más impresionantes de la era mesozoica',
        weight: '2'
      }
    })
  );
  
  // Títulos y descripciones para el segundo slide
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[1].id,
        type: 'HEADER',
        content: 'Tours Virtuales 360°',
        weight: '1'
      }
    })
  );
  
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[1].id,
        type: 'PARAGRAPH',
        content: 'Explora el museo desde la comodidad de tu hogar',
        weight: '2'
      }
    })
  );
  
  // Títulos y descripciones para el tercer slide
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[2].id,
        type: 'HEADER',
        content: 'Noche en el Museo',
        weight: '1'
      }
    })
  );
  
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[2].id,
        type: 'PARAGRAPH',
        content: 'Visitas nocturnas especiales cada fin de semana',
        weight: '2'
      }
    })
  );
  
  // Ejecutar todas las operaciones de copia de slides
  await Promise.all(slideCopies);

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