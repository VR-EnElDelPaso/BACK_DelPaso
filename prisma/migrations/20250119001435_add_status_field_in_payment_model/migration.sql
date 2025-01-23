/*
  Warnings:

  - Added the required column `status` to the `payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('pending', 'approved', 'authorized', 'in_process', 'in_mediation', 'rejected', 'cancelled', 'refunded', 'charged_back');

-- AlterTable
ALTER TABLE "payment" ADD COLUMN     "status" "payment_status" NOT NULL;
