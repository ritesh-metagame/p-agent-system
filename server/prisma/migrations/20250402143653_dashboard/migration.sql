-- CreateTable
CREATE TABLE `Dashboard` (
    `id` VARCHAR(191) NOT NULL,
    `commissionsOverviewId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FinancialOverview` (
    `id` VARCHAR(191) NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `pendingCommission` DOUBLE NOT NULL,
    `releasedAllTime` DOUBLE NOT NULL,
    `totalSummary` DOUBLE NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EGamesOverview` (
    `id` VARCHAR(191) NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `dailyOverview` DOUBLE NOT NULL,
    `pendingCommission` DOUBLE NOT NULL,
    `releasedAllTime` DOUBLE NOT NULL,
    `totalSummary` DOUBLE NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SportsBettingOverview` (
    `id` VARCHAR(191) NOT NULL,
    `item` VARCHAR(191) NOT NULL,
    `dailyOverview` VARCHAR(191) NOT NULL,
    `pendingCommission` DOUBLE NOT NULL,
    `releasedAllTime` DOUBLE NOT NULL,
    `totalSummary` DOUBLE NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopPerformersOverview` (
    `id` VARCHAR(191) NOT NULL,
    `operatorName` VARCHAR(191) NOT NULL,
    `pendingCommission` DOUBLE NOT NULL,
    `releasedAllTime` DOUBLE NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopPerformersOverviewPerCutoff` (
    `id` VARCHAR(191) NOT NULL,
    `operatorName` VARCHAR(191) NOT NULL,
    `pendingCommission` DOUBLE NOT NULL,
    `releasedAllTime` DOUBLE NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopPlayersDepositsOverview` (
    `id` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `depositsMade` DOUBLE NOT NULL,
    `totalDeposits` DOUBLE NOT NULL,
    `operatorName` VARCHAR(191) NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TopPlayersGGROverview` (
    `id` VARCHAR(191) NOT NULL,
    `playerName` VARCHAR(191) NOT NULL,
    `ggrMade` DOUBLE NOT NULL,
    `totalGGR` DOUBLE NOT NULL,
    `operatorName` VARCHAR(191) NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OperatorStatistic` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `approved` INTEGER NOT NULL,
    `pending` INTEGER NOT NULL,
    `declined` INTEGER NOT NULL,
    `dashboardId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionsOverview` (
    `id` VARCHAR(191) NOT NULL,
    `cutoffPeriodAvailableForSettlement` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CommissionData` (
    `id` VARCHAR(191) NOT NULL,
    `roleId` VARCHAR(191) NOT NULL,
    `pendingCommission` DOUBLE NOT NULL,
    `releasedAllTime` DOUBLE NOT NULL,
    `commissionsOverviewId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Dashboard` ADD CONSTRAINT `Dashboard_commissionsOverviewId_fkey` FOREIGN KEY (`commissionsOverviewId`) REFERENCES `CommissionsOverview`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FinancialOverview` ADD CONSTRAINT `FinancialOverview_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EGamesOverview` ADD CONSTRAINT `EGamesOverview_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SportsBettingOverview` ADD CONSTRAINT `SportsBettingOverview_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPerformersOverview` ADD CONSTRAINT `TopPerformersOverview_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPerformersOverviewPerCutoff` ADD CONSTRAINT `TopPerformersOverviewPerCutoff_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPlayersDepositsOverview` ADD CONSTRAINT `TopPlayersDepositsOverview_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TopPlayersGGROverview` ADD CONSTRAINT `TopPlayersGGROverview_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OperatorStatistic` ADD CONSTRAINT `OperatorStatistic_dashboardId_fkey` FOREIGN KEY (`dashboardId`) REFERENCES `Dashboard`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CommissionData` ADD CONSTRAINT `CommissionData_commissionsOverviewId_fkey` FOREIGN KEY (`commissionsOverviewId`) REFERENCES `CommissionsOverview`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
