/*
  Warnings:

  - You are about to drop the `_paymentTotour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `museum` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `open_hour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tour` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_tour_purchase` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('CART', 'PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED');

-- DropForeignKey
ALTER TABLE "_paymentTotour" DROP CONSTRAINT "_paymentTotour_A_fkey";

-- DropForeignKey
ALTER TABLE "_paymentTotour" DROP CONSTRAINT "_paymentTotour_B_fkey";

-- DropForeignKey
ALTER TABLE "open_hour" DROP CONSTRAINT "open_hour_museum_id_fkey";

-- DropForeignKey
ALTER TABLE "payment" DROP CONSTRAINT "payment_user_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_tour_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_user_id_fkey";

-- DropForeignKey
ALTER TABLE "tour" DROP CONSTRAINT "tour_museum_id_fkey";

-- DropForeignKey
ALTER TABLE "user_tour_purchase" DROP CONSTRAINT "user_tour_purchase_tour_id_fkey";

-- DropForeignKey
ALTER TABLE "user_tour_purchase" DROP CONSTRAINT "user_tour_purchase_user_id_fkey";

-- DropTable
DROP TABLE "_paymentTotour";

-- DropTable
DROP TABLE "museum";

-- DropTable
DROP TABLE "open_hour";

-- DropTable
DROP TABLE "payment";

-- DropTable
DROP TABLE "review";

-- DropTable
DROP TABLE "tour";

-- DropTable
DROP TABLE "user";

-- DropTable
DROP TABLE "user_tour_purchase";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "account_number" INTEGER,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "image" TEXT,
    "password" TEXT,
    "email_verified" TIMESTAMP(3),
    "role" "Role" NOT NULL DEFAULT 'VISITOR',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "cancelled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preference" (
    "id" TEXT NOT NULL,
    "mercado_pago_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "mercad_pago_id" TEXT NOT NULL,
    "transaction_details" JSONB NOT NULL,
    "status" "payment_status" NOT NULL,
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tour" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "stars" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "url" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "museum_id" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Museum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address_name" TEXT NOT NULL,
    "main_photo" TEXT NOT NULL,
    "main_tour_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Museum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "comment" TEXT,
    "user_id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OpenHour" (
    "id" TEXT NOT NULL,
    "day" "Day" NOT NULL,
    "open_time" TEXT NOT NULL,
    "close_time" TEXT NOT NULL,
    "museum_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OpenHour_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_OrderToTour" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_account_number_key" ON "User"("account_number");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Order_user_id_idx" ON "Order"("user_id");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_created_at_idx" ON "Order"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "Preference_mercado_pago_id_key" ON "Preference"("mercado_pago_id");

-- CreateIndex
CREATE UNIQUE INDEX "Preference_order_id_key" ON "Preference"("order_id");

-- CreateIndex
CREATE INDEX "Preference_order_id_idx" ON "Preference"("order_id");

-- CreateIndex
CREATE INDEX "Preference_mercado_pago_id_idx" ON "Preference"("mercado_pago_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_mercad_pago_id_key" ON "Payment"("mercad_pago_id");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_order_id_key" ON "Payment"("order_id");

-- CreateIndex
CREATE INDEX "Payment_order_id_idx" ON "Payment"("order_id");

-- CreateIndex
CREATE INDEX "Payment_mercad_pago_id_idx" ON "Payment"("mercad_pago_id");

-- CreateIndex
CREATE INDEX "Tour_museum_id_idx" ON "Tour"("museum_id");

-- CreateIndex
CREATE INDEX "Museum_main_tour_id_idx" ON "Museum"("main_tour_id");

-- CreateIndex
CREATE INDEX "Review_user_id_idx" ON "Review"("user_id");

-- CreateIndex
CREATE INDEX "Review_tour_id_idx" ON "Review"("tour_id");

-- CreateIndex
CREATE INDEX "OpenHour_museum_id_idx" ON "OpenHour"("museum_id");

-- CreateIndex
CREATE UNIQUE INDEX "_OrderToTour_AB_unique" ON "_OrderToTour"("A", "B");

-- CreateIndex
CREATE INDEX "_OrderToTour_B_index" ON "_OrderToTour"("B");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tour" ADD CONSTRAINT "Tour_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "Museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OpenHour" ADD CONSTRAINT "OpenHour_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "Museum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToTour" ADD CONSTRAINT "_OrderToTour_A_fkey" FOREIGN KEY ("A") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_OrderToTour" ADD CONSTRAINT "_OrderToTour_B_fkey" FOREIGN KEY ("B") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;
