/*
  Warnings:

  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CommissionData` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CommissionsOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Dashboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EGamesOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinancialOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OperatorStatistic` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SportsBettingOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopPerformersOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopPerformersOverviewPerCutoff` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopPlayersDepositsOverview` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TopPlayersGGROverview` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `role_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CommissionData` DROP FOREIGN KEY `CommissionData_commissionsOverviewId_fkey`;

-- DropForeignKey
ALTER TABLE `Dashboard` DROP FOREIGN KEY `Dashboard_commissionsOverviewId_fkey`;

-- DropForeignKey
ALTER TABLE `EGamesOverview` DROP FOREIGN KEY `EGamesOverview_dashboardId_fkey`;

-- DropForeignKey
ALTER TABLE `FinancialOverview` DROP FOREIGN KEY `FinancialOverview_dashboardId_fkey`;

-- DropForeignKey
ALTER TABLE `OperatorStatistic` DROP FOREIGN KEY `OperatorStatistic_dashboardId_fkey`;

-- DropForeignKey
ALTER TABLE `SportsBettingOverview` DROP FOREIGN KEY `SportsBettingOverview_dashboardId_fkey`;

-- DropForeignKey
ALTER TABLE `TopPerformersOverview` DROP FOREIGN KEY `TopPerformersOverview_dashboardId_fkey`;

-- DropForeignKey
ALTER TABLE `TopPerformersOverviewPerCutoff` DROP FOREIGN KEY `TopPerformersOverviewPerCutoff_dashboardId_fkey`;

-- DropForeignKey
ALTER TABLE `TopPlayersDepositsOverview` DROP FOREIGN KEY `TopPlayersDepositsOverview_dashboardId_fkey`;

-- DropForeignKey
ALTER TABLE `TopPlayersGGROverview` DROP FOREIGN KEY `TopPlayersGGROverview_dashboardId_fkey`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `role`,
    ADD COLUMN `parent_id` VARCHAR(191) NULL,
    ADD COLUMN `role_id` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `CommissionData`;

-- DropTable
DROP TABLE `CommissionsOverview`;

-- DropTable
DROP TABLE `Dashboard`;

-- DropTable
DROP TABLE `EGamesOverview`;

-- DropTable
DROP TABLE `FinancialOverview`;

-- DropTable
DROP TABLE `OperatorStatistic`;

-- DropTable
DROP TABLE `SportsBettingOverview`;

-- DropTable
DROP TABLE `TopPerformersOverview`;

-- DropTable
DROP TABLE `TopPerformersOverviewPerCutoff`;

-- DropTable
DROP TABLE `TopPlayersDepositsOverview`;

-- DropTable
DROP TABLE `TopPlayersGGROverview`;

-- CreateTable
CREATE TABLE `Commission` (
    `id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `commission_percentage` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Commission_site_id_idx`(`site_id`),
    INDEX `Commission_user_id_idx`(`user_id`),
    INDEX `Commission_role_id_idx`(`role_id`),
    INDEX `Commission_category_id_idx`(`category_id`),
    UNIQUE INDEX `Commission_site_id_user_id_role_id_category_id_key`(`site_id`, `user_id`, `role_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Site` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Site_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BetSummary` (
    `id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `total_bets` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `BetSummary_site_id_idx`(`site_id`),
    INDEX `BetSummary_date_idx`(`date`),
    UNIQUE INDEX `BetSummary_site_id_date_key`(`site_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategorySummary` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `total_bets` INTEGER NOT NULL,
    `total_commissions` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CategorySummary_category_id_idx`(`category_id`),
    INDEX `CategorySummary_date_idx`(`date`),
    UNIQUE INDEX `CategorySummary_category_id_date_key`(`category_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionSummary` (
    `id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `total_commission_amount` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CommissionSummary_site_id_idx`(`site_id`),
    INDEX `CommissionSummary_user_id_idx`(`user_id`),
    INDEX `CommissionSummary_role_id_idx`(`role_id`),
    INDEX `CommissionSummary_date_idx`(`date`),
    UNIQUE INDEX `CommissionSummary_site_id_user_id_role_id_date_key`(`site_id`, `user_id`, `role_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentSummary` (
    `id` VARCHAR(191) NOT NULL,
    `agent_id` VARCHAR(191) NOT NULL,
    `total_bets` INTEGER NOT NULL,
    `total_commission` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AgentSummary_agent_id_idx`(`agent_id`),
    INDEX `AgentSummary_date_idx`(`date`),
    UNIQUE INDEX `AgentSummary_agent_id_date_key`(`agent_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BetSummary` ADD CONSTRAINT `BetSummary_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategorySummary` ADD CONSTRAINT `CategorySummary_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionSummary` ADD CONSTRAINT `CommissionSummary_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionSummary` ADD CONSTRAINT `CommissionSummary_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionSummary` ADD CONSTRAINT `CommissionSummary_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgentSummary` ADD CONSTRAINT `AgentSummary_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
