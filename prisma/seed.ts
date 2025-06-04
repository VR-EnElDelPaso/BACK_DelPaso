import { PrismaClient, Day } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Limpia la base de datos antes de insertar nuevos datos
  await prisma.faq.deleteMany();
  await prisma.copy.deleteMany();
  await prisma.slide.deleteMany();
  await prisma.carrousel.deleteMany();
  await prisma.page.deleteMany();
  await prisma.tourTag.deleteMany();
  await prisma.tour.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.openHour.deleteMany();
  await prisma.museum.deleteMany();
  await prisma.user.deleteMany();

  // Crear 4 usuarios con los nuevos campos completos
  const users = await Promise.all([
    prisma.user.create({
      data: {
        account_number: 20183890,
        name: "Miguel Angel",
        first_lastname: "Rosado",
        second_lastname: "González",
        display_name: "Miguel",
        email: "miguel@example.com",
        role: "STUDENT",
        password: bcrypt.hashSync("password"),
        is_verified: true,
      },
    }),
    prisma.user.create({
      data: {
        name: "Admin",
        first_lastname: "Sistema",
        second_lastname: "Principal",
        display_name: "Admin",
        email: "admin@admin.com",
        role: "ADMIN",
        password: bcrypt.hashSync("tamaldepollo"),
        is_verified: true,
      },
    }),
    prisma.user.create({
      data: {
        account_number: 1234,
        name: "Carlos",
        first_lastname: "Rodríguez",
        second_lastname: "Martínez",
        display_name: "Carlos",
        email: "carlos@ucol.mx",
        role: "WORKER",
        password: bcrypt.hashSync("password"),
        is_verified: true,
      },
    }),
    prisma.user.create({
      data: {
        name: "Laura",
        first_lastname: "Martínez",
        second_lastname: "López",
        display_name: "Laura",
        email: "laura@example.com",
        role: "VISITOR",
        password: bcrypt.hashSync("password"),
        is_verified: true,
      },
    }),
  ]);

  console.log("Users created:", users.length);

  // Crear preguntas frecuentes (FAQs)
  const faqs = await Promise.all([
    prisma.faq.create({
      data: {
        title: "¿Qué es MUVi?",
        description:
          "MUVi es una plataforma que ofrece recorridos virtuales por museos y sitios de interés cultural, permitiéndote explorar exhibiciones desde cualquier lugar.",
      },
    }),
    prisma.faq.create({
      data: {
        title: "¿Cómo puedo comprar un tour virtual?",
        description:
          "Puedes comprar un tour virtual seleccionándolo en nuestra página, agregándolo al carrito y realizando el pago a través de Mercado Pago. Una vez completada la compra, tendrás acceso inmediato.",
      },
    }),
    prisma.faq.create({
      data: {
        title:
          "¿Por cuánto tiempo tengo acceso a un tour después de comprarlo?",
        description:
          "El acceso a los tours varía según el tipo de recorrido. Por lo general, tendrás acceso durante 30 días después de la compra, pero esto se especifica en la descripción de cada tour.",
      },
    }),
    prisma.faq.create({
      data: {
        title: "¿Qué hago si tengo problemas técnicos durante un tour?",
        description:
          "Si experimentas problemas técnicos, puedes contactar a nuestro soporte técnico a través del formulario de contacto o enviando un correo a soporte@muvi.com.",
      },
    }),
    prisma.faq.create({
      data: {
        title: "¿Ofrecen descuentos para estudiantes?",
        description:
          "Sí, ofrecemos descuentos especiales para estudiantes. Para acceder a estos descuentos, debes registrarte con tu correo institucional y verificar tu estado como estudiante.",
      },
    }),
  ]);

  console.log("FAQs created:", faqs.length);

  // Crear Tags
  const tags = await Promise.all([
    prisma.tag.create({ data: { name: "universitario" } }),
    prisma.tag.create({ data: { name: "local" } }),
    prisma.tag.create({ data: { name: "otros estados" } }),
    prisma.tag.create({ data: { name: "otros países" } }),
  ]);

  console.log("Tags created:", tags.length);

  // Crear Museos con horas de apertura
  const museums = await Promise.all([
    // Museo Fernando Del Paso
    prisma.museum.create({
      data: {
        name: "Museo Universitario Fernando del Paso",
        description:
          "El Museo Fernando del Paso es un espacio dedicado a la obra y legado del destacado escritor, pintor y diplomático mexicano. Alberga una colección permanente de manuscritos, pinturas y objetos personales del autor, ofreciendo a los visitantes una inmersión en su universo creativo.",
        address_name: "C. 27 de Septiembre 119, Centro, 28000 Colima, Col.",
        main_photo:
          "https://res.cloudinary.com/dstcjr7lh/image/upload/v1746495993/muvi/gnavoznxcxvvuvhv3rc3.jpg",
        latitude: 19.244015338719084,
        longitude: -103.72513560414563,
        open_hours: {
          create: [
            {
              day: Day.MONDAY,
              is_open: false,
              open_time: null,
              close_time: null,
            },
            {
              day: Day.TUESDAY,
              is_open: true,
              open_time: "10:00",
              close_time: "14:00",
            },
            {
              day: Day.WEDNESDAY,
              is_open: true,
              open_time: "10:00",
              close_time: "14:00",
            },
            {
              day: Day.THURSDAY,
              is_open: true,
              open_time: "10:00",
              close_time: "14:00",
            },
            {
              day: Day.FRIDAY,
              is_open: true,
              open_time: "10:00",
              close_time: "14:00",
            },
            {
              day: Day.SATURDAY,
              is_open: true,
              open_time: "10:00",
              close_time: "14:00",
            },
            {
              day: Day.SUNDAY,
              is_open: false,
              open_time: null,
              close_time: null,
            },
          ],
        },
      },
    }),
  ]);

  console.log("Museums created:", museums.length);

  // Crear Tours con múltiples Tags
  const tours = await Promise.all([
    prisma.tour.create({
      data: {
        name: "Neomexicanismos",
        description: "Recorrido por la colección de Neomexicanismos del museo",
        price: 80,
        stars: 0,
        url: "https://kuula.co/share/collection/7ZYnc?logo=-1&info=0&fs=1&vr=1&thumbs=3&alpha=0.77&inst=es",
        image_url:
          "https://res.cloudinary.com/dxdme71no/image/upload/v1748024618/qxoo2s1eldiajxl8mh4s.png",
        museum_id: museums[0].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[0].id } } }, // Universitario
            { tag: { connect: { id: tags[1].id } } }, // Local
          ],
        },
      },
    }),
    prisma.tour.create({
      data: {
        name: "Instalaciones Fernando del Paso",
        description:
          'El primer recorrido virtual en el museo de arte emergente "Fernando del Paso"',
        price: 80,
        stars: 0,
        url: "https://kuula.co/share/5TCxb/collection/7cp8f?logo=-1&info=0&fs=1&vr=1&thumbs=3&alpha=0.77&inst=es",
        image_url:
          "https://res.cloudinary.com/dstcjr7lh/image/upload/v1746495993/muvi/gnavoznxcxvvuvhv3rc3.jpg",
        museum_id: museums[0].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[0].id } } }, // Universitario
            { tag: { connect: { id: tags[1].id } } }, // Local
          ],
        },
      },
    }),
    prisma.tour.create({
      data: {
        name: "Mutante",
        description:
          'Recorrido por la colección de Mutante en el museo de arte emergente "Fernando del Paso"',
        price: 80,
        stars: 0,
        url: "https://kuula.co/share/collection/7KHM3?logo=-1&info=0&fs=1&vr=1&thumbs=3&alpha=0.77&inst=es",
        image_url:
          "https://res.cloudinary.com/dxdme71no/image/upload/v1748025101/d2jlakfwlphzajwo9q28.png",
        museum_id: museums[0].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[0].id } } }, // Universitario
            { tag: { connect: { id: tags[1].id } } }, // Local
          ],
        },
      },
    }),
    prisma.tour.create({
      data: {
        name: "Palabralma",
        description:
          'Primera colección expuesta en el museo de arte emergente "Fernando del Paso"',
        price: 80,
        stars: 0,
        url: "https://kuula.co/share/collection/7cTcT?logo=-1&info=0&fs=1&vr=1&thumbs=3&alpha=0.77&inst=es",
        image_url:
          "https://res.cloudinary.com/dxdme71no/image/upload/v1748025300/ewkzlvclqvw8h75iwdsc.png",
        museum_id: museums[0].id,
        tags: {
          create: [
            { tag: { connect: { id: tags[0].id } } }, // Universitario
            { tag: { connect: { id: tags[1].id } } }, // Local
          ],
        },
      },
    }),
  ]);

  console.log("Tours created:", tours.length);

  // Crear la landing page principal
  const landingPage = await prisma.page.create({
    data: {
      name: "Landing Page Principal",
      description: "Página de inicio del sitio web del museo",
    },
  });

  // Crear algunos textos (copies) para la página de landing
  await Promise.all([
    prisma.copy.create({
      data: {
        entity_id: landingPage.id,
        type: "HEADER",
        content: "Bienvenidos a MUVi",
        weight: "1",
      },
    }),
    prisma.copy.create({
      data: {
        entity_id: landingPage.id,
        type: "PARAGRAPH",
        content: "Descubre nuestras exhibiciones únicas y tours virtuales",
        weight: "2",
      },
    }),
    prisma.copy.create({
      data: {
        entity_id: landingPage.id,
        type: "BUTTON",
        content: "Explorar Tours",
        weight: "3",
      },
    }),
  ]);

  // Crear carrusel principal
  const mainCarousel = await prisma.carrousel.create({
    data: {
      page_id: landingPage.id,
      name: "Novedades",
      description: "Carrusel de novedades del museo",
    },
  });

  // Crear slides para el carrusel con URLs reales de Cloudinary
  const slides = await Promise.all([
    prisma.slide.create({
      data: {
        carrousel_id: mainCarousel.id,
        index: 0,
        image_url:
          "https://res.cloudinary.com/dstcjr7lh/image/upload/v1741855373/muvi/s72bz9z8k2tiv3foqiky.png",
      },
    }),
    prisma.slide.create({
      data: {
        carrousel_id: mainCarousel.id,
        index: 1,
        image_url:
          "https://res.cloudinary.com/dstcjr7lh/image/upload/v1741855373/muvi/kwy0uzbptfmkz7yr4mvh.png",
      },
    }),
    prisma.slide.create({
      data: {
        carrousel_id: mainCarousel.id,
        index: 2,
        image_url:
          "https://res.cloudinary.com/dstcjr7lh/image/upload/v1741855375/muvi/teyab9iidjpzjsarmkbt.png",
      },
    }),
  ]);

  console.log("Slides created:", slides.length);

  // Crear títulos y descripciones para los slides como copies
  const slideCopies = [];

  // Títulos y descripciones para el primer slide
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[0].id,
        type: "HEADER",
        content: "Conoce MUVI",
        weight: "1",
      },
    })
  );

  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[0].id,
        type: "PARAGRAPH",
        content:
          "MUVi está listo para ofrecerte las mejores experiencias en Recorridos Virtuales",
        weight: "2",
      },
    })
  );

  // Títulos y descripciones para el segundo slide
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[1].id,
        type: "HEADER",
        content: "Conoce MUVI",
        weight: "1",
      },
    })
  );

  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[1].id,
        type: "PARAGRAPH",
        content: "Hacemos del arte una experiencia cercana para ti.",
        weight: "2",
      },
    })
  );

  // Títulos y descripciones para el tercer slide
  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[2].id,
        type: "HEADER",
        content: "Conoce MUVI",
        weight: "1",
      },
    })
  );

  slideCopies.push(
    prisma.copy.create({
      data: {
        entity_id: slides[2].id,
        type: "PARAGRAPH",
        content: "Descubre nuestros recorridos y elige tu favorito.",
        weight: "2",
      },
    })
  );

  // Ejecutar todas las operaciones de copia de slides
  await Promise.all(slideCopies);

  console.log("Slide copies created:", slideCopies.length);
  console.log("✅ Seeding completed successfully with updated User model!");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
