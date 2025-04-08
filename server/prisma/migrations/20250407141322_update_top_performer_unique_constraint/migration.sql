-- AlterTable
ALTER TABLE `TopPerformerSummary` ADD COLUMN `pending_transactions` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `total_transactions` INTEGER NOT NULL DEFAULT 0;
