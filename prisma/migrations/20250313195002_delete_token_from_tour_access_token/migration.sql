/*
  Warnings:

  - You are about to drop the column `token` on the `TourAccessToken` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "TourAccessToken_token_key";

-- AlterTable
ALTER TABLE "TourAccessToken" DROP COLUMN "token";
