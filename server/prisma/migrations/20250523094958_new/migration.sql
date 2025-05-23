-- AlterTable
ALTER TABLE `commission_summaries` ADD COLUMN `settledByOperator` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `settledByPlatinum` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `settledBySuperadmin` BOOLEAN NULL DEFAULT false;
