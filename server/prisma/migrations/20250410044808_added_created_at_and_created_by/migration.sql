/*
  Warnings:

  - You are about to drop the column `settlement_ending_at` on the `commission` table. All the data in the column will be lost.
  - You are about to drop the column `settlement_starting_from` on the `commission` table. All the data in the column will be lost.
  - The values [WEEKLY,BI_WEEKLY] on the enum `Commission_settlement_period` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `agent` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `agentsummary` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `betsummary` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `category` ADD COLUMN `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `categorylog` MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `categorysummary` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `commission` DROP COLUMN `settlement_ending_at`,
    DROP COLUMN `settlement_starting_from`,
    ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system',
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `settlement_period` ENUM('BI_MONTHLY', 'MONTHLY') NOT NULL DEFAULT 'MONTHLY';

-- AlterTable
ALTER TABLE `commissionsummary` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `networkstatistics` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `role` ADD COLUMN `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `site` ADD COLUMN `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system',
    MODIFY `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    MODIFY `updatedAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `transactioncommission` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system';

-- AlterTable
ALTER TABLE `user` ADD COLUMN `created_by` VARCHAR(191) NULL DEFAULT 'system',
    ADD COLUMN `updated_by` VARCHAR(191) NULL DEFAULT 'system',
    MODIFY `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `usersite` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system';
