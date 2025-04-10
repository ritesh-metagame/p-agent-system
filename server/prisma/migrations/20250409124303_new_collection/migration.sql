-- Drop the existing table first
DROP TABLE IF EXISTS `transactioncommission`;

-- CreateTable
CREATE TABLE `GameTransaction` (
    `id` INTEGER NOT NULL,
    `bet_amount` DOUBLE NOT NULL,
    `bet_id` VARCHAR(191) NOT NULL,
    `brand` VARCHAR(191) NOT NULL,
    `channel_type` VARCHAR(191) NOT NULL,
    `game_id` INTEGER NOT NULL,
    `game_name` VARCHAR(191) NOT NULL,
    `game_provider` VARCHAR(191) NOT NULL,
    `game_status_id` INTEGER NOT NULL,
    `game_type` VARCHAR(191) NOT NULL,
    `jackpot_contribution` DOUBLE NULL,
    `jackpot_details` VARCHAR(191) NULL,
    `jackpot_payout` DOUBLE NULL,
    `jackpot_type` VARCHAR(191) NULL,
    `kiosk_terminal` VARCHAR(191) NULL,
    `machine_id` VARCHAR(191) NULL,
    `outlet_id` VARCHAR(191) NULL,
    `payout_amount` DOUBLE NULL,
    `platform_code` VARCHAR(191) NULL,
    `platform_name` VARCHAR(191) NULL,
    `player_id` VARCHAR(191) NULL,
    `prematch_live` VARCHAR(191) NULL,
    `refund_amount` DOUBLE NULL,
    `round_id` VARCHAR(191) NULL,
    `seed_contri_amount` DOUBLE NULL,
    `settlement_time` DATETIME(3) NULL,
    `site` VARCHAR(191) NULL,
    `sport` VARCHAR(191) NULL,
    `status` VARCHAR(191) NULL,
    `ticket_status` VARCHAR(191) NULL,
    `time_of_bet` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `timestamp` DATETIME(3) NULL,
    `transaction_id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransactionCommission` (
    `id` VARCHAR(191) NOT NULL,
    `betId` VARCHAR(191) NOT NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `betAmount` DOUBLE NOT NULL,
    `payoutAmount` DOUBLE NOT NULL,
    `refundAmount` DOUBLE NOT NULL,
    `depositAmount` DOUBLE NOT NULL,
    `withdrawAmount` DOUBLE NOT NULL,
    `siteId` VARCHAR(191) NOT NULL,
    `agentGoldenId` VARCHAR(191) NOT NULL,
    `agentPlatinumId` VARCHAR(191) NOT NULL,
    `agentOperatorId` VARCHAR(191) NOT NULL,
    `transactionType` VARCHAR(191) NOT NULL,
    `settled` BOOLEAN NOT NULL,
    `commissionId` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
-- CREATE TABLE `Agent` (
--     `id` VARCHAR(191) NOT NULL,
--     `percentage` DOUBLE NOT NULL,
--     `amount` DOUBLE NOT NULL,

--     PRIMARY KEY (`id`)
-- ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentGoldenId_fkey` FOREIGN KEY (`agentGoldenId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentPlatinumId_fkey` FOREIGN KEY (`agentPlatinumId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentOperatorId_fkey` FOREIGN KEY (`agentOperatorId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
