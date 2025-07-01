/*
  Warnings:

  - You are about to drop the column `isParitallySettled` on the `settlementhistory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `SettlementHistory` DROP COLUMN `isParitallySettled`,
    ADD COLUMN `isPartiallySettled` BOOLEAN NOT NULL DEFAULT false;
