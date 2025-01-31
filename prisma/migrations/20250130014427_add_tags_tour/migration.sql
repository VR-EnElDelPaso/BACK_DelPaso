-- CreateEnum
CREATE TYPE "TourTag" AS ENUM ('University', 'Local', 'States', 'Country');

-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "tags" "TourTag"[] DEFAULT ARRAY[]::"TourTag"[];
