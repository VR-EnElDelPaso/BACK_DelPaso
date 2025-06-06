-- AlterTable
ALTER TABLE "Tour" ADD COLUMN     "accreditable_hours" DECIMAL(5,2),
ADD COLUMN     "is_accreditable" BOOLEAN NOT NULL DEFAULT false;
