/*
  Warnings:

  - Added the required column `user_id` to the `NetworkStatistics` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `networkstatistics` ADD COLUMN `user_id` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `NetworkStatistics` ADD CONSTRAINT `NetworkStatistics_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
