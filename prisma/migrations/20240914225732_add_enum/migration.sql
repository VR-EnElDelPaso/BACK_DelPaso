/*
  Warnings:

  - You are about to drop the column `type` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `type`,
    ADD COLUMN `emailVerified` DATETIME(3) NULL,
    ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('ASPIRANT', 'STUDENT', 'ADMIN') NOT NULL DEFAULT 'ASPIRANT';
