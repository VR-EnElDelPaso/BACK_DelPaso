/*
  Warnings:

  - You are about to drop the `review` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_tour_id_fkey";

-- DropForeignKey
ALTER TABLE "review" DROP CONSTRAINT "review_user_id_fkey";

-- AlterTable
ALTER TABLE "tour" ADD COLUMN     "museum_id" TEXT NOT NULL DEFAULT '';

-- DropTable
DROP TABLE "review";

-- CreateTable
CREATE TABLE "museum" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address_name" TEXT NOT NULL,
    "main_photo" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "main_tour_id" TEXT NOT NULL,

    CONSTRAINT "museum_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "museum_main_tour_id_key" ON "museum"("main_tour_id");

-- AddForeignKey
ALTER TABLE "tour" ADD CONSTRAINT "tour_museum_id_fkey" FOREIGN KEY ("museum_id") REFERENCES "museum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "museum" ADD CONSTRAINT "museum_main_tour_id_fkey" FOREIGN KEY ("main_tour_id") REFERENCES "tour"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
