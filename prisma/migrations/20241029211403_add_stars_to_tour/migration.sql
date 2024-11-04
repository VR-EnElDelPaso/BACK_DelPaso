/*
  Warnings:

  - Added the required column `stars` to the `tour` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tour" ADD COLUMN     "stars" DOUBLE PRECISION NOT NULL;
