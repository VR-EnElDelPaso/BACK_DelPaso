import app from "./app";
import config from "./config";
import prisma from "./prisma";

app.listen(config.app.port, async () => {
  console.log(`---[Environment: ${config.app.env}]---\n`);
  console.log(`---[Config Loaded]---`);
  console.log(config);

  // test database connection
  console.log('\n---[Test db connection]---');
  try {
    await prisma.$connect();
    
    const museums = await prisma.museum.findMany({
      where: {
        main_tour_id: {
          not: null
        }
      }
    });
    
    console.log(museums);
    
    console.log('\n---[Connected to database]---');
    console.log(`\n\n---[Listening on port ${config.app.port}]---\n`);
  } catch (error) {
    throw new Error('Error connecting to database');
  }
});