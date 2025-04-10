/*
  Warnings:

  - You are about to drop the `CommissionSummary` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `CommissionSummary` DROP FOREIGN KEY `CommissionSummary_role_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommissionSummary` DROP FOREIGN KEY `CommissionSummary_site_id_fkey`;

-- DropForeignKey
ALTER TABLE `CommissionSummary` DROP FOREIGN KEY `CommissionSummary_user_id_fkey`;

-- DropTable
DROP TABLE `CommissionSummary`;

-- CreateTable
CREATE TABLE `commission_summaries` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `totalDeposit` DOUBLE NOT NULL DEFAULT 0,
    `totalWithdrawals` DOUBLE NOT NULL DEFAULT 0,
    `totalBetAmount` DOUBLE NOT NULL DEFAULT 0,
    `netGGR` DOUBLE NOT NULL DEFAULT 0,
    `grossCommission` DOUBLE NOT NULL DEFAULT 0,
    `paymentGatewayFee` DOUBLE NOT NULL DEFAULT 0,
    `netCommissionAvailablePayout` DOUBLE NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `siteId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
