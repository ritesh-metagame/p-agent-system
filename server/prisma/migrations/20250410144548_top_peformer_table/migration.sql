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
