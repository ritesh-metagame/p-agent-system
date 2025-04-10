/*
  Warnings:

  - You are about to drop the column `approved_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `declined_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `pending_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `suspended_count` on the `networkstatistics` table. All the data in the column will be lost.
  - You are about to drop the column `total_count` on the `networkstatistics` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `networkstatistics` DROP COLUMN `approved_count`,
    DROP COLUMN `declined_count`,
    DROP COLUMN `pending_count`,
    DROP COLUMN `suspended_count`,
    DROP COLUMN `total_count`,
    ADD COLUMN `gold_user_approved_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `gold_user_declined_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `gold_user_pending_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `gold_user_suspended_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `gold_user_total_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `operator_user_approved_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `operator_user_declined_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `operator_user_pending_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `operator_user_suspended_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `operator_user_total_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `platinum_user_approved_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `platinum_user_declined_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `platinum_user_pending_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `platinum_user_suspended_count` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `platinum_user_total_count` INTEGER NOT NULL DEFAULT 0;
