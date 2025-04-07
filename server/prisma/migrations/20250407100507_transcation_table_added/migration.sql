-- CreateTable
CREATE TABLE `Transaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `betId` VARCHAR(191) NOT NULL,
    `settlementTime` DATETIME(3) NULL,
    `timeOfBet` DATETIME(3) NULL,
    `outletId` VARCHAR(191) NULL,
    `playerId` VARCHAR(191) NULL,
    `playerName` VARCHAR(191) NULL,
    `transactionId` VARCHAR(191) NOT NULL,
    `gameId` VARCHAR(191) NULL,
    `gameName` VARCHAR(191) NULL,
    `gameType` VARCHAR(191) NULL,
    `gameProvider` VARCHAR(191) NULL,
    `machineId` VARCHAR(191) NULL,
    `betAmount` DECIMAL(65, 30) NULL,
    `payoutAmount` DECIMAL(65, 30) NULL,
    `refundAmount` DECIMAL(65, 30) NULL,
    `depositAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `withdrawAmount` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `jackpotContribution` VARCHAR(191) NULL,
    `jackpotPayout` VARCHAR(191) NULL,
    `seedContriAmount` VARCHAR(191) NULL,
    `jackpotType` VARCHAR(191) NULL,
    `jackpotDetails` VARCHAR(191) NULL,
    `channelType` VARCHAR(191) NULL,
    `brand` VARCHAR(191) NULL,
    `sport` VARCHAR(191) NULL,
    `ticketStatus` VARCHAR(191) NULL,
    `prematchLive` VARCHAR(191) NULL,
    `kioskTerminal` VARCHAR(191) NULL,
    `platformCode` INTEGER NULL,
    `platformName` VARCHAR(191) NULL,
    `gameStatusId` VARCHAR(191) NULL,
    `roundId` VARCHAR(191) NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `agent_admin_id` VARCHAR(191) NULL,
    `agentAdminName` VARCHAR(191) NULL,
    `agent_owner_id` VARCHAR(191) NULL,
    `agentOwnerName` VARCHAR(191) NULL,
    `agent_master_id` VARCHAR(191) NULL,
    `agentMasterName` VARCHAR(191) NULL,
    `agent_golden_id` VARCHAR(191) NULL,
    `agentGoldenName` VARCHAR(191) NULL,
    `agentUserType` VARCHAR(191) NULL,
    `ownerActualPercentage` DECIMAL(65, 30) NULL,
    `ownerPercentage` DECIMAL(65, 30) NULL,
    `masterAgentPercentage` DECIMAL(65, 30) NULL,
    `goldenAgentPercentage` DECIMAL(65, 30) NULL,
    `ggrAmount` DECIMAL(65, 30) NULL,
    `totalCommission` DECIMAL(65, 30) NULL,
    `ownerCommission` DECIMAL(65, 30) NULL,
    `masterAgentCommission` DECIMAL(65, 30) NULL,
    `goldenAgentCommission` DECIMAL(65, 30) NULL,
    `depositCommission` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `withdrawCommission` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `transactionType` ENUM('bet', 'deposit', 'withdraw') NOT NULL DEFAULT 'bet',
    `status` VARCHAR(191) NULL,
    `settled` VARCHAR(191) NULL DEFAULT 'N',
    `timestamp` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NULL,

    INDEX `Transaction_agent_admin_id_idx`(`agent_admin_id`),
    INDEX `Transaction_agent_owner_id_idx`(`agent_owner_id`),
    INDEX `Transaction_agent_master_id_idx`(`agent_master_id`),
    INDEX `Transaction_agent_golden_id_idx`(`agent_golden_id`),
    INDEX `Transaction_playerId_idx`(`playerId`),
    INDEX `Transaction_betId_idx`(`betId`),
    INDEX `Transaction_timeOfBet_idx`(`timeOfBet`),
    INDEX `Transaction_status_idx`(`status`),
    INDEX `Transaction_settled_idx`(`settled`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_agent_admin_id_fkey` FOREIGN KEY (`agent_admin_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_agent_owner_id_fkey` FOREIGN KEY (`agent_owner_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_agent_master_id_fkey` FOREIGN KEY (`agent_master_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transaction` ADD CONSTRAINT `Transaction_agent_golden_id_fkey` FOREIGN KEY (`agent_golden_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
