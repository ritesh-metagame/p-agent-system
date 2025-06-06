/*
  Warnings:

  - The values [MONTHLY] on the enum `Commission_settlement_period` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `gold_user_approved_count` on the `NetworkStatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_declined_count` on the `NetworkStatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_pending_count` on the `NetworkStatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_suspended_count` on the `NetworkStatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_total_count` on the `NetworkStatistics` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `commission_summaries` table. All the data in the column will be lost.
  - Added the required column `total_assigned_commission_percentage` to the `Commission` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryName` to the `commission_summaries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `commission_summaries` DROP FOREIGN KEY `commission_summaries_categoryId_fkey`;

-- DropIndex
DROP INDEX `commission_summaries_categoryId_fkey` ON `commission_summaries`;

-- AlterTable
ALTER TABLE `Commission` ADD COLUMN `parent_percentage` DOUBLE NULL,
    ADD COLUMN `total_assigned_commission_percentage` DOUBLE NOT NULL,
    MODIFY `settlement_period` ENUM('BI_MONTHLY', 'WEEKLY') NOT NULL DEFAULT 'BI_MONTHLY';

-- AlterTable
ALTER TABLE `NetworkStatistics` DROP COLUMN `gold_user_approved_count`,
    DROP COLUMN `gold_user_declined_count`,
    DROP COLUMN `gold_user_pending_count`,
    DROP COLUMN `gold_user_suspended_count`,
    DROP COLUMN `gold_user_total_count`,
    ADD COLUMN `golden_user_approved_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `golden_user_declined_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `golden_user_pending_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `golden_user_suspended_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `golden_user_total_count` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `transactionType` ENUM('bet', 'deposit', 'withdraw') NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `approved` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `commission_summaries` DROP COLUMN `categoryId`,
    ADD COLUMN `categoryName` VARCHAR(191) NOT NULL,
    ADD COLUMN `pendingSettleCommission` DOUBLE NOT NULL DEFAULT 0;
