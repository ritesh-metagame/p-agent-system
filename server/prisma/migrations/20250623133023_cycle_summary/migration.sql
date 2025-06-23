-- CreateTable
CREATE TABLE `completed_cycle_summaries` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `categoryName` VARCHAR(191) NOT NULL,
    `cycleStart` DATETIME(3) NOT NULL,
    `cycleEnd` DATETIME(3) NOT NULL,
    `netGGR` DOUBLE NOT NULL DEFAULT 0,
    `netCommissionAvailablePayout` DOUBLE NOT NULL DEFAULT 0,
    `totalBetAmount` DOUBLE NOT NULL DEFAULT 0,
    `pendingSettleCommission` DOUBLE NOT NULL DEFAULT 0,
    `settledByOperator` BOOLEAN NOT NULL DEFAULT false,
    `settledByPlatinum` BOOLEAN NOT NULL DEFAULT false,
    `settledBySuperadmin` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
