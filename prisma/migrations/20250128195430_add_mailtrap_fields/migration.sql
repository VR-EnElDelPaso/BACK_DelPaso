/*
  Warnings:

  - You are about to drop the column `email_verified` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "email_verified",
ADD COLUMN     "is_verified" BOOLEAN,
ADD COLUMN     "verificationToken" TEXT,
ADD COLUMN     "verificationTokenExpiresAt" TIMESTAMP(3);
