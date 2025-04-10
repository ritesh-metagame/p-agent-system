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
CREATE TABLE `Agent` (
    `id` VARCHAR(191) NOT NULL,
    `percentage` DOUBLE NOT NULL,
    `amount` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentGoldenId_fkey` FOREIGN KEY (`agentGoldenId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentPlatinumId_fkey` FOREIGN KEY (`agentPlatinumId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TransactionCommission` ADD CONSTRAINT `TransactionCommission_agentOperatorId_fkey` FOREIGN KEY (`agentOperatorId`) REFERENCES `Agent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
