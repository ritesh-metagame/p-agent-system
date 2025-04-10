-- AlterTable
ALTER TABLE `commission` MODIFY `settlement_period` ENUM('BI_MONTHLY', 'MONTHLY') NOT NULL DEFAULT 'BI_MONTHLY';
