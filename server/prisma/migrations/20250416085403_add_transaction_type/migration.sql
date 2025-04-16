-- AlterTable
ALTER TABLE `Transaction` ADD COLUMN `transactionType` ENUM('bet', 'deposit', 'withdraw') NULL;
