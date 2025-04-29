/*
  Warnings:

  - Added the required column `total_assigned_commission_percentage` to the `Commission` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `commission` ADD COLUMN `parent_percentage` DOUBLE NULL,
    ADD COLUMN `total_assigned_commission_percentage` DOUBLE NOT NULL;
