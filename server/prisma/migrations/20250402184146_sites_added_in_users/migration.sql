/*
  Warnings:

  - You are about to drop the column `site_id` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_site_id_fkey`;

-- DropIndex
DROP INDEX `User_site_id_fkey` ON `User`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `site_id`;

-- CreateTable
CREATE TABLE `UserSite` (
    `user_id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `UserSite_user_id_idx`(`user_id`),
    INDEX `UserSite_site_id_idx`(`site_id`),
    PRIMARY KEY (`user_id`, `site_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserSite` ADD CONSTRAINT `UserSite_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSite` ADD CONSTRAINT `UserSite_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
