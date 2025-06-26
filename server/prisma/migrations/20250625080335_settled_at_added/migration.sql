/*
  Warnings:

  - You are about to alter the column `deposit` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `withdrawal` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `betAmount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `payoutAmount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `refundAmount` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `revenue` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `pgFeeCommission` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `ownerPercentage` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `ownerCommission` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `maPercentage` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `maCommission` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - You are about to alter the column `gaPercentage` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - You are about to alter the column `gaCommission` on the `transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(20,5)`.
  - Added the required column `settledAt` to the `completed_cycle_summaries` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `commission_summaries` MODIFY `totalDeposit` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `totalWithdrawals` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `totalBetAmount` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `netGGR` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `grossCommission` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `paymentGatewayFee` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `netCommissionAvailablePayout` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `pendingSettleCommission` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `parentCommission` DECIMAL(20, 5) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `completed_cycle_summaries` ADD COLUMN `parentCommission` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    ADD COLUMN `settledAt` DATETIME(3) NOT NULL,
    ADD COLUMN `settledStatus` VARCHAR(191) NOT NULL DEFAULT 'N',
    MODIFY `netGGR` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `netCommissionAvailablePayout` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `totalBetAmount` DECIMAL(20, 5) NOT NULL DEFAULT 0,
    MODIFY `pendingSettleCommission` DECIMAL(20, 5) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `settlementhistory` ADD COLUMN `isPartiallySettledByOperator` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPartiallySettledByPlatinum` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isPartiallySettledBySuperAdmin` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `transaction` MODIFY `deposit` DECIMAL(20, 5) NOT NULL DEFAULT 0.00,
    MODIFY `withdrawal` DECIMAL(20, 5) NOT NULL DEFAULT 0.00,
    MODIFY `betAmount` DECIMAL(20, 5) NULL,
    MODIFY `payoutAmount` DECIMAL(20, 5) NULL,
    MODIFY `refundAmount` DECIMAL(20, 5) NULL,
    MODIFY `revenue` DECIMAL(20, 5) NULL,
    MODIFY `pgFeeCommission` DECIMAL(20, 5) NULL,
    MODIFY `ownerPercentage` DECIMAL(5, 2) NULL,
    MODIFY `ownerCommission` DECIMAL(20, 5) NULL,
    MODIFY `maPercentage` DECIMAL(5, 2) NULL,
    MODIFY `maCommission` DECIMAL(20, 5) NULL,
    MODIFY `gaPercentage` DECIMAL(5, 2) NULL,
    MODIFY `gaCommission` DECIMAL(20, 5) NULL;
