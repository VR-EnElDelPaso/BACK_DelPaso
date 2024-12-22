/*
  Warnings:

  - Changed the type of `open_time` on the `open_hour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `close_time` on the `open_hour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "open_hour" DROP COLUMN "open_time",
ADD COLUMN     "open_time" TIMESTAMP(3) NOT NULL,
DROP COLUMN "close_time",
ADD COLUMN     "close_time" TIMESTAMP(3) NOT NULL;
