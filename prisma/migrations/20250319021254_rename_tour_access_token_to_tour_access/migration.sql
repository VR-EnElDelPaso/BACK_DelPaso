/*
  Warnings:

  - You are about to drop the `TourAccessToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TourAccessToken" DROP CONSTRAINT "TourAccessToken_order_id_fkey";

-- DropForeignKey
ALTER TABLE "TourAccessToken" DROP CONSTRAINT "TourAccessToken_tour_id_fkey";

-- DropForeignKey
ALTER TABLE "TourAccessToken" DROP CONSTRAINT "TourAccessToken_user_id_fkey";

-- DropTable
DROP TABLE "TourAccessToken";

-- CreateTable
CREATE TABLE "TourAccess" (
    "id" TEXT NOT NULL,
    "tour_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TourAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TourAccess_tour_id_idx" ON "TourAccess"("tour_id");

-- AddForeignKey
ALTER TABLE "TourAccess" ADD CONSTRAINT "TourAccess_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "Tour"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourAccess" ADD CONSTRAINT "TourAccess_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TourAccess" ADD CONSTRAINT "TourAccess_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
