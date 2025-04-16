/*
  Warnings:

  - You are about to drop the column `categoryId` on the `commission_summaries` table. All the data in the column will be lost.
  - Added the required column `categoryName` to the `commission_summaries` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `commission_summaries` DROP FOREIGN KEY `commission_summaries_categoryId_fkey`;

-- DropIndex
DROP INDEX `commission_summaries_categoryId_fkey` ON `commission_summaries`;

-- AlterTable
ALTER TABLE `commission_summaries` DROP COLUMN `categoryId`,
    ADD COLUMN `categoryName` VARCHAR(191) NOT NULL;
