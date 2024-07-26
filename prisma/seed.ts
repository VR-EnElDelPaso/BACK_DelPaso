import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear algunos usuarios
  await prisma.user.create({
    data: {
      account_number: 20183890,
      name: 'Miguel Angel',
      display_name: 1,
      email: 'john@example.com',
      type: 'regular',
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
