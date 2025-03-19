/*
  Warnings:

  - Added the required column `expires_at` to the `TourAccessToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `TourAccessToken` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TourAccessToken" ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TourAccessToken" ADD CONSTRAINT "TourAccessToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
