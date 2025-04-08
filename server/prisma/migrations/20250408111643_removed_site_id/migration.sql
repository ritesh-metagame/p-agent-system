/*
  Warnings:

  - You are about to drop the column `site_id` on the `NetworkStatistics` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[role_id,calculation_date]` on the table `NetworkStatistics` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `NetworkStatistics` DROP FOREIGN KEY `NetworkStatistics_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `NetworkStatistics` DROP FOREIGN KEY `NetworkStatistics_site_id_fkey`;

-- DropIndex
DROP INDEX `NetworkStatistics_role_id_site_id_calculation_date_key` ON `NetworkStatistics`;

-- DropIndex
DROP INDEX `NetworkStatistics_site_id_idx` ON `NetworkStatistics`;

-- AlterTable
ALTER TABLE `NetworkStatistics` DROP COLUMN `site_id`;

-- CreateIndex
CREATE UNIQUE INDEX `NetworkStatistics_role_id_calculation_date_key` ON `NetworkStatistics`(`role_id`, `calculation_date`);

-- AddForeignKey
ALTER TABLE `NetworkStatistics` ADD CONSTRAINT `NetworkStatistics_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
