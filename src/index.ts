import app from "./app";
import config from "./config";
import prisma from "./prisma";

app.listen(config.app.port, async () => {
  console.log('Listening on port %d', config.app.port);

  // test database connection
  try {
    await prisma.$connect();
    console.log('Connected to database');

    const userTourRelation = await prisma.user.findFirst({
      select: {
        user_tour_purchase: {
          select: {
            tour: true,
          },
        },
      }
    });

    const userPurchasedTours = userTourRelation?.user_tour_purchase.map((purchasedTour) => purchasedTour.tour)
    console.log(userPurchasedTours);

  } catch (error) {
    throw new Error('Error connecting to database');
  }
});