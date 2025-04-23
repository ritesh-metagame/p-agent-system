/*
  Warnings:

  - You are about to drop the column `gold_user_approved_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_declined_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_pending_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_suspended_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `gold_user_total_count` on the `networkstatistics` table. All the data in the column will be lost.

*/
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
