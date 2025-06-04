/*
  Warnings:

  - Added the required column `first_lastname` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `second_lastname` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "first_lastname" TEXT NOT NULL,
ADD COLUMN     "second_lastname" TEXT NOT NULL;
