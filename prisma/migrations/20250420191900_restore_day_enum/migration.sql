/*
  Warnings:

  - Changed the type of `day` on the `OpenHour` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Day" AS ENUM ('MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY');

-- AlterTable
ALTER TABLE "OpenHour" DROP COLUMN "day",
ADD COLUMN     "day" "Day" NOT NULL;
