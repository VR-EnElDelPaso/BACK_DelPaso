import app from "./app";
import config from "./config";
import prisma from "./prisma";

app.listen(config.app.port, async () => {
  console.log('Listening on port %d', config.app.port);
  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (error) {
    throw new Error('Error connecting to database');
  }
});