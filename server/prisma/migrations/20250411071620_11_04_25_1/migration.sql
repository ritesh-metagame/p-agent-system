/*
  Warnings:

  - A unique constraint covering the columns `[role_id,user_id,calculation_date]` on the table `NetworkStatistics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `networkstatistics` DROP FOREIGN KEY `NetworkStatistics_role_id_fkey`;

-- DropIndex
DROP INDEX `NetworkStatistics_role_id_calculation_date_key` ON `networkstatistics`;

-- CreateIndex
CREATE UNIQUE INDEX `NetworkStatistics_role_id_user_id_calculation_date_key` ON `NetworkStatistics`(`role_id`, `user_id`, `calculation_date`);

-- RenameIndex
ALTER TABLE `networkstatistics` RENAME INDEX `NetworkStatistics_user_id_fkey` TO `NetworkStatistics_user_id_idx`;
