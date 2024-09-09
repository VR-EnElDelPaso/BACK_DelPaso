/*
  Warnings:

  - A unique constraint covering the columns `[account_number]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `user_account_number_key` ON `user`(`account_number`);
