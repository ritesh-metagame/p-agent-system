-- AlterTable
ALTER TABLE `commission_summaries` ADD COLUMN `settledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `settledStatus` VARCHAR(191) NULL;
