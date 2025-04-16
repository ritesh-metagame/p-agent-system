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
CREATE TABLE `TransactionCommissionSummary` (
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
CREATE TABLE `AgentInfo` (
    `id` VARCHAR(191) NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Commission` (
    `id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `settlement_period` ENUM('BI_MONTHLY', 'MONTHLY') NOT NULL DEFAULT 'BI_MONTHLY',
    `role_id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `commission_percentage` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    INDEX `Commission_site_id_idx`(`site_id`),
    INDEX `Commission_user_id_idx`(`user_id`),
    INDEX `Commission_role_id_idx`(`role_id`),
    INDEX `Commission_category_id_idx`(`category_id`),
    UNIQUE INDEX `Commission_site_id_user_id_role_id_category_id_key`(`site_id`, `user_id`, `role_id`, `category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `commission_summaries` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `totalDeposit` DOUBLE NOT NULL DEFAULT 0,
    `totalWithdrawals` DOUBLE NOT NULL DEFAULT 0,
    `totalBetAmount` DOUBLE NOT NULL DEFAULT 0,
    `netGGR` DOUBLE NOT NULL DEFAULT 0,
    `grossCommission` DOUBLE NOT NULL DEFAULT 0,
    `paymentGatewayFee` DOUBLE NOT NULL DEFAULT 0,
    `netCommissionAvailablePayout` DOUBLE NOT NULL DEFAULT 0,
    `settledStatus` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `settledAt` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    `siteId` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system',

    UNIQUE INDEX `Category_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system',

    UNIQUE INDEX `Role_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Site` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system',

    UNIQUE INDEX `Site_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSite` (
    `user_id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NOT NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NOT NULL DEFAULT 'system',

    INDEX `UserSite_user_id_idx`(`user_id`),
    INDEX `UserSite_site_id_idx`(`site_id`),
    PRIMARY KEY (`user_id`, `site_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategoryLog` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NOT NULL,
    `updated_by_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CategoryLog_category_id_idx`(`category_id`),
    INDEX `CategoryLog_created_by_id_idx`(`created_by_id`),
    INDEX `CategoryLog_updated_by_id_idx`(`updated_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoleLog` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NOT NULL,
    `updated_by_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RoleLog_role_id_idx`(`role_id`),
    INDEX `RoleLog_created_by_id_idx`(`created_by_id`),
    INDEX `RoleLog_updated_by_id_idx`(`updated_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SiteLog` (
    `id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `created_by_id` VARCHAR(191) NOT NULL,
    `updated_by_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `SiteLog_site_id_idx`(`site_id`),
    INDEX `SiteLog_created_by_id_idx`(`created_by_id`),
    INDEX `SiteLog_updated_by_id_idx`(`updated_by_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BetSummary` (
    `id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `total_bets` INTEGER NOT NULL,
    `total_amount` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    INDEX `BetSummary_site_id_idx`(`site_id`),
    INDEX `BetSummary_date_idx`(`date`),
    UNIQUE INDEX `BetSummary_site_id_date_key`(`site_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopPerformerSummary` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `site_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `settled_transactions` INTEGER NOT NULL DEFAULT 0,
    `pending_transactions` INTEGER NOT NULL DEFAULT 0,
    `total_transactions` INTEGER NOT NULL DEFAULT 0,
    `operator_name` VARCHAR(191) NULL,
    `pending_commission` DOUBLE NULL,
    `released_all_time` DOUBLE NULL,
    `calculation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `TopPerformerSummary_site_id_idx`(`site_id`),
    INDEX `TopPerformerSummary_user_id_idx`(`user_id`),
    INDEX `TopPerformerSummary_role_id_idx`(`role_id`),
    UNIQUE INDEX `TopPerformerSummary_user_id_site_id_calculation_date_key`(`user_id`, `site_id`, `calculation_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CategorySummary` (
    `id` VARCHAR(191) NOT NULL,
    `category_id` VARCHAR(191) NOT NULL,
    `total_bets` INTEGER NOT NULL,
    `total_commissions` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    INDEX `CategorySummary_category_id_idx`(`category_id`),
    INDEX `CategorySummary_date_idx`(`date`),
    UNIQUE INDEX `CategorySummary_category_id_date_key`(`category_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AgentSummary` (
    `id` VARCHAR(191) NOT NULL,
    `agent_id` VARCHAR(191) NOT NULL,
    `total_bets` INTEGER NOT NULL,
    `total_commission` DOUBLE NOT NULL,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    INDEX `AgentSummary_agent_id_idx`(`agent_id`),
    INDEX `AgentSummary_date_idx`(`date`),
    UNIQUE INDEX `AgentSummary_agent_id_date_key`(`agent_id`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `NetworkStatistics` (
    `id` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `user_id` VARCHAR(191) NOT NULL,
    `operator_user_approved_count` INTEGER NOT NULL DEFAULT 0,
    `operator_user_pending_count` INTEGER NOT NULL DEFAULT 0,
    `operator_user_declined_count` INTEGER NOT NULL DEFAULT 0,
    `operator_user_suspended_count` INTEGER NOT NULL DEFAULT 0,
    `operator_user_total_count` INTEGER NOT NULL DEFAULT 0,
    `platinum_user_approved_count` INTEGER NOT NULL DEFAULT 0,
    `platinum_user_pending_count` INTEGER NOT NULL DEFAULT 0,
    `platinum_user_declined_count` INTEGER NOT NULL DEFAULT 0,
    `platinum_user_suspended_count` INTEGER NOT NULL DEFAULT 0,
    `platinum_user_total_count` INTEGER NOT NULL DEFAULT 0,
    `gold_user_approved_count` INTEGER NOT NULL DEFAULT 0,
    `gold_user_pending_count` INTEGER NOT NULL DEFAULT 0,
    `gold_user_declined_count` INTEGER NOT NULL DEFAULT 0,
    `gold_user_suspended_count` INTEGER NOT NULL DEFAULT 0,
    `gold_user_total_count` INTEGER NOT NULL DEFAULT 0,
    `calculation_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    INDEX `NetworkStatistics_role_id_idx`(`role_id`),
    INDEX `NetworkStatistics_user_id_idx`(`user_id`),
    UNIQUE INDEX `NetworkStatistics_role_id_user_id_calculation_date_key`(`role_id`, `user_id`, `calculation_date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopPerformer` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `playerId` VARCHAR(191) NOT NULL,
    `userRole` VARCHAR(191) NOT NULL,
    `deposit` DOUBLE NOT NULL,
    `totalBetAmount` DOUBLE NOT NULL,
    `GGR` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transaction` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `transactionId` VARCHAR(191) NOT NULL,
    `betTime` DATETIME(3) NULL,
    `userId` VARCHAR(191) NULL,
    `playerName` VARCHAR(191) NULL,
    `platformType` VARCHAR(191) NULL,
    `deposit` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `withdrawal` DECIMAL(65, 30) NOT NULL DEFAULT 0.00,
    `betAmount` DECIMAL(65, 30) NULL,
    `payoutAmount` DECIMAL(65, 30) NULL,
    `refundAmount` DECIMAL(65, 30) NULL,
    `revenue` DECIMAL(65, 30) NULL,
    `pgFeeCommission` DECIMAL(65, 30) NULL,
    `status` VARCHAR(191) NULL,
    `settled` VARCHAR(191) NULL DEFAULT 'N',
    `ownerId` VARCHAR(191) NULL,
    `ownerName` VARCHAR(191) NULL,
    `ownerPercentage` DECIMAL(65, 30) NULL,
    `ownerCommission` DECIMAL(65, 30) NULL,
    `maId` VARCHAR(191) NULL,
    `maName` VARCHAR(191) NULL,
    `maPercentage` DECIMAL(65, 30) NULL,
    `maCommission` DECIMAL(65, 30) NULL,
    `gaId` VARCHAR(191) NULL,
    `gaName` VARCHAR(191) NULL,
    `gaPercentage` DECIMAL(65, 30) NULL,
    `gaCommission` DECIMAL(65, 30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    INDEX `Transaction_transactionId_idx`(`transactionId`),
    INDEX `Transaction_userId_idx`(`userId`),
    INDEX `Transaction_betTime_idx`(`betTime`),
    INDEX `Transaction_status_idx`(`status`),
    INDEX `Transaction_settled_idx`(`settled`),
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
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Agent` (
    `id` VARCHAR(191) NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role_id` VARCHAR(191) NOT NULL,
    `affiliate_link` VARCHAR(191) NULL,
    `firstName` VARCHAR(191) NULL,
    `lastName` VARCHAR(191) NULL,
    `mobileNumber` VARCHAR(191) NULL,
    `bankName` VARCHAR(191) NULL,
    `accountNumber` VARCHAR(191) NULL,
    `approved` BOOLEAN NOT NULL DEFAULT true,
    `parent_id` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_by` VARCHAR(191) NULL DEFAULT 'system',
    `updated_by` VARCHAR(191) NULL DEFAULT 'system',

    UNIQUE INDEX `User_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransactionCommissionSummary` ADD CONSTRAINT `TransactionCommissionSummary_agentGoldenId_fkey` FOREIGN KEY (`agentGoldenId`) REFERENCES `AgentInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommissionSummary` ADD CONSTRAINT `TransactionCommissionSummary_agentPlatinumId_fkey` FOREIGN KEY (`agentPlatinumId`) REFERENCES `AgentInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommissionSummary` ADD CONSTRAINT `TransactionCommissionSummary_agentOperatorId_fkey` FOREIGN KEY (`agentOperatorId`) REFERENCES `AgentInfo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Commission` ADD CONSTRAINT `Commission_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `commission_summaries` ADD CONSTRAINT `commission_summaries_siteId_fkey` FOREIGN KEY (`siteId`) REFERENCES `Site`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSite` ADD CONSTRAINT `UserSite_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSite` ADD CONSTRAINT `UserSite_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryLog` ADD CONSTRAINT `CategoryLog_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryLog` ADD CONSTRAINT `CategoryLog_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategoryLog` ADD CONSTRAINT `CategoryLog_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleLog` ADD CONSTRAINT `RoleLog_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleLog` ADD CONSTRAINT `RoleLog_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoleLog` ADD CONSTRAINT `RoleLog_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteLog` ADD CONSTRAINT `SiteLog_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteLog` ADD CONSTRAINT `SiteLog_created_by_id_fkey` FOREIGN KEY (`created_by_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SiteLog` ADD CONSTRAINT `SiteLog_updated_by_id_fkey` FOREIGN KEY (`updated_by_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BetSummary` ADD CONSTRAINT `BetSummary_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPerformerSummary` ADD CONSTRAINT `TopPerformerSummary_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPerformerSummary` ADD CONSTRAINT `TopPerformerSummary_site_id_fkey` FOREIGN KEY (`site_id`) REFERENCES `Site`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPerformerSummary` ADD CONSTRAINT `TopPerformerSummary_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CategorySummary` ADD CONSTRAINT `CategorySummary_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AgentSummary` ADD CONSTRAINT `AgentSummary_agent_id_fkey` FOREIGN KEY (`agent_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NetworkStatistics` ADD CONSTRAINT `NetworkStatistics_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `NetworkStatistics` ADD CONSTRAINT `NetworkStatistics_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentGoldenId_fkey` FOREIGN KEY (`agentGoldenId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentPlatinumId_fkey` FOREIGN KEY (`agentPlatinumId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentOperatorId_fkey` FOREIGN KEY (`agentOperatorId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_role_id_fkey` FOREIGN KEY (`role_id`) REFERENCES `Role`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
