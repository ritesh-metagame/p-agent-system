/*
  Warnings:

  - Added the required column `reference_id` to the `SettlementHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `SettlementHistory` ADD COLUMN `reference_id` VARCHAR(191) NOT NULL;
