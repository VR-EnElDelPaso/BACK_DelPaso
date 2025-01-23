-- DropForeignKey
ALTER TABLE "open_hour" DROP CONSTRAINT "open_hour_museum_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_tour_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tour" DROP CONSTRAINT "tour_museum_id_fkey";

-- CreateTable
CREATE TABLE "payment" (
    "id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_payment_id_key" ON "payment"("payment_id");

-- AddForeignKey
ALTER TABLE "payment" ADD CONSTRAINT "payment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tour" ADD CONSTRAINT "tour_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review" ADD CONSTRAINT "review_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "open_hour" ADD CONSTRAINT "open_hour_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;
